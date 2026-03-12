import { useCallback, useState } from "react";
import { apiClient, PurchaseResponse } from "../api/client";
import {
  PaymentProvider,
  AnalyticsCategory,
  AnalyticsAction,
} from "../helpers/enum";
import { useAnalytics } from "./useAnalytics";
import { useUserContext } from "../contexts/user.context";

export const useTelegramPayment = () => {
  const { trackEvent, trackError } = useAnalytics();
  const { userInfo, fetchUserInfo } = useUserContext();

  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const isFirstPurchase = useCallback(() => {
    if (!userInfo) return true;

    const hasActiveSubscription =
      userInfo.subscription_until &&
      new Date(userInfo.subscription_until) > new Date();

    const hasConfigs = userInfo.configs && userInfo.configs.length > 0;

    if (hasActiveSubscription || hasConfigs) {
      return false;
    }

    return true;
  }, [userInfo]);

  const checkPaymentStatus = useCallback(
    async (paymentId: string) => {
      try {
        const status = await apiClient.checkPaymentStatus(paymentId);

        if (status.subscription_created) {
          const isFirst = isFirstPurchase();
          let message = isFirst
            ? "🎉 Поздравляем с первой покупкой! Подписка активирована."
            : "🙏 Спасибо за продление! Подписка обновлена.";

          if (status.config_link) {
            message += `\n\n🔗 Конфигурация VPN:\n${status.config_link}\n\nСкопируйте ссылку и откройте в приложении v2RayTun.`;
          }

          if (status.expiry_date) {
            const expiryDate = new Date(status.expiry_date).toLocaleDateString(
              "ru-RU",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            );
            message += `\n\n📅 Подписка действует до: ${expiryDate}`;
          }

          localStorage.removeItem("pending_payment_id");

          fetchUserInfo();

          trackEvent({
            action: AnalyticsAction.PAYMENT_COMPLETED,
            category: AnalyticsCategory.PAYMENT,
            label: PaymentProvider.STARS,
            customData: {
              paymentId,
              subscriptionCreated: true,
              isFirstPurchase: isFirst,
              purchaseType: isFirst ? "first_purchase" : "renewal",
            },
          });

          return true;
        } else if (status.status === "already_completed") {
          localStorage.removeItem("pending_payment_id");
          return true;
        } else if (
          status.status === "failed" ||
          status.status === "cancelled" ||
          status.status === "expired"
        ) {
          localStorage.removeItem("pending_payment_id");

          trackEvent({
            action: AnalyticsAction.PAYMENT_FAILED,
            category: AnalyticsCategory.PAYMENT,
            label: PaymentProvider.STARS,
            customData: { paymentId, status: status.status },
          });

          return false;
        }

        return false;
      } catch (error) {
        trackError({
          error: error instanceof Error ? error.message : "Unknown error",
          component: "useTelegramPayment",
          action: "checkPaymentStatus",
          customData: { paymentId },
        });
        return false;
      }
    },
    [trackEvent, trackError, isFirstPurchase, fetchUserInfo],
  );

  const startPaymentStatusCheck = useCallback(
    (paymentId: string) => {
      if (!paymentId) return;

      const intervalId = setInterval(async () => {
        const ok = await checkPaymentStatus(paymentId);
        if (ok === true) {
          clearInterval(intervalId);
        }
      }, 3000);

      setTimeout(
        () => {
          clearInterval(intervalId);
          const pendingId = localStorage.getItem("pending_payment_id");
          if (pendingId === paymentId) {
            localStorage.removeItem("pending_payment_id");
          }
        },
        10 * 60 * 1000,
      );
    },
    [checkPaymentStatus],
  );

  const handleStarsPayment = useCallback(
    async (purchaseResponse: PurchaseResponse) => {
      if (purchaseResponse.provider !== PaymentProvider.STARS) {
        throw new Error("Invalid payment provider for Stars payment");
      }

      try {
        const invoiceUrl =
          purchaseResponse.invoice_url || purchaseResponse.invoice?.invoice_url;

        if (!invoiceUrl) {
          throw new Error("Missing invoice URL in Stars payment response");
        }

        const paymentId =
          purchaseResponse.invoice?.payment_id || purchaseResponse.external_id;
        if (paymentId) {
          localStorage.setItem("pending_payment_id", paymentId);
          startPaymentStatusCheck(paymentId);
        }

        if (
          typeof window !== "undefined" &&
          window.Telegram?.WebApp?.openInvoice
        ) {
          window.Telegram.WebApp.openInvoice(invoiceUrl, (status) => {
            if (status === "failed" || status === "cancelled") {
              localStorage.removeItem("pending_payment_id");
            }
          });
        } else if (
          typeof window !== "undefined" &&
          window.Telegram?.WebApp?.openTelegramLink
        ) {
          window.Telegram.WebApp.openTelegramLink(invoiceUrl);
        } else if (
          typeof window !== "undefined" &&
          window.Telegram?.WebApp?.openLink
        ) {
          window.Telegram.WebApp.openLink(invoiceUrl);
        } else {
          window.open(invoiceUrl, "_blank");
        }
      } catch (error) {
        throw error;
      }
    },
    [startPaymentStatusCheck],
  );

  const handleYooKassaPayment = useCallback(
    (purchaseResponse: PurchaseResponse) => {
      if (purchaseResponse.provider !== PaymentProvider.YOOKASSA) {
        throw new Error(
          `Invalid payment provider: ${purchaseResponse.provider}`,
        );
      }

      if (!purchaseResponse.payment_url) {
        const message =
          "Ссылка для оплаты YooKassa не получена. Попробуйте еще раз или обратитесь в поддержку.";
        if (
          typeof window !== "undefined" &&
          window.Telegram?.WebApp?.showAlert
        ) {
          window.Telegram.WebApp.showAlert(message);
        } else {
          if (window.Telegram?.WebApp?.showAlert) {
            window.Telegram.WebApp.showAlert(message);
          }
        }
        return;
      }

      const url = purchaseResponse.payment_url;
      if (typeof window !== "undefined" && window.Telegram?.WebApp?.openLink) {
        // Telegram clients (mobile) reliably open external links via openLink
        window.Telegram.WebApp.openLink(url);
      } else if (typeof window !== "undefined") {
        // Fallbacks for desktop browsers/others
        try {
          window.open(url, "_blank");
        } catch {
          window.location.href = url;
        }
      }
    },
    [],
  );

  const handleCryptoPayment = useCallback(
    (purchaseResponse: PurchaseResponse) => {
      if (purchaseResponse.provider !== PaymentProvider.CRYPTO) {
        throw new Error(
          `Invalid payment provider: ${purchaseResponse.provider}`,
        );
      }

      if (!purchaseResponse.payment_url) {
        const message =
          "Ссылка для оплаты криптовалютой не получена. Попробуйте еще раз или обратитесь в поддержку.";
        if (
          typeof window !== "undefined" &&
          window.Telegram?.WebApp?.showAlert
        ) {
          window.Telegram.WebApp.showAlert(message);
        } else {
          if (window.Telegram?.WebApp?.showAlert) {
            window.Telegram.WebApp.showAlert(message);
          }
        }
        return;
      }

      const url = purchaseResponse.payment_url;
      if (typeof window !== "undefined" && window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(url);
      } else if (typeof window !== "undefined") {
        try {
          window.open(url, "_blank");
        } catch {
          window.location.href = url;
        }
      }
    },
    [],
  );

  const handleBalancePayment = useCallback(
    (purchaseResponse: PurchaseResponse) => {
      if (
        purchaseResponse.provider &&
        purchaseResponse.provider !== PaymentProvider.BALANCE
      ) {
        throw new Error("Invalid payment provider for balance payment");
      }

      if (
        !purchaseResponse.success &&
        !purchaseResponse.message &&
        !purchaseResponse.provider
      ) {
        setPaymentModal({
          isOpen: true,
          message: "Оплата не произошла. Попробуйте еще раз.",
          type: "error",
        });
        throw new Error("Empty balance payment response");
      }

      if (purchaseResponse.success) {
        const isFirst = isFirstPurchase();
        let message = isFirst
          ? "🎉 Поздравляем с первой покупкой! Оплата с баланса успешно проведена!"
          : "🙏 Спасибо за продление! Оплата с баланса успешно проведена!";

        if (purchaseResponse.config_id) {
          message += `\n\n🔗 Конфигурация VPN будет доступна после обновления данных.`;
        }

        if (purchaseResponse.expiry_date) {
          const expiryDate = new Date(
            purchaseResponse.expiry_date,
          ).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          message += `\n\n📅 Подписка действует до: ${expiryDate}`;
        }

        setPaymentModal({
          isOpen: true,
          message: message,
          type: "success",
        });

        fetchUserInfo();
      } else {
        const errorMessage =
          purchaseResponse.message || "Ошибка оплаты с баланса";
        setPaymentModal({
          isOpen: true,
          message: errorMessage,
          type: "error",
        });
        throw new Error("Balance payment failed");
      }
    },
    [isFirstPurchase, fetchUserInfo],
  );

  const checkPendingPayment = useCallback(async () => {
    const pendingPaymentId = localStorage.getItem("pending_payment_id");
    if (pendingPaymentId) {
      startPaymentStatusCheck(pendingPaymentId);
      return true;
    }
    return false;
  }, [startPaymentStatusCheck]);

  const processPayment = useCallback(
    async (purchaseResponse: PurchaseResponse) => {
      if (
        purchaseResponse.success !== undefined &&
        purchaseResponse.payment_id &&
        !purchaseResponse.provider
      ) {
        return handleBalancePayment(purchaseResponse);
      }

      switch (purchaseResponse.provider) {
        case PaymentProvider.STARS:
          return await handleStarsPayment(purchaseResponse);
        case PaymentProvider.YOOKASSA:
          return handleYooKassaPayment(purchaseResponse);
        case PaymentProvider.CRYPTO:
          return handleCryptoPayment(purchaseResponse);
        case PaymentProvider.BALANCE:
          return handleBalancePayment(purchaseResponse);
        default:
          throw new Error(
            `Unsupported payment provider: ${purchaseResponse.provider}`,
          );
      }
    },
    [
      handleStarsPayment,
      handleYooKassaPayment,
      handleCryptoPayment,
      handleBalancePayment,
    ],
  );

  const closePaymentModal = useCallback(() => {
    setPaymentModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    processPayment,
    handleStarsPayment,
    handleYooKassaPayment,
    handleCryptoPayment,
    handleBalancePayment,
    checkPendingPayment,
    startPaymentStatusCheck,
    paymentModal,
    closePaymentModal,
  };
};

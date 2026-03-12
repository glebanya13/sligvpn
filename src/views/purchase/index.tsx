import { useEffect, useState } from "react";
import { Tariff } from "../../api/client";
import { PaymentProvider, BalanceType } from "../../helpers/enum";
import PaymentModal from "../../components/PaymentModal";
import TariffCard from "../../components/TariffCard";
import { AnalyticsEvents, useAnalytics } from "../../hooks/useAnalytics";
import {
  useBalancePurchase,
  usePurchase,
  useTariffs,
} from "../../hooks/useApi";
import { useUserContext } from "../../contexts/user.context";
import { useTelegramPage } from "../../hooks/useTelegramPage";
import { useTelegramPayment } from "../../hooks/useTelegramPayment";
import "./style.css";

const paymentModalAnimationStyles = `
  @keyframes paymentModalFadeIn {
    0% { 
      opacity: 0;
      backdrop-filter: blur(0px);
    }
    100% { 
      opacity: 1;
      backdrop-filter: blur(8px);
    }
  }
  
  @keyframes paymentModalFadeOut {
    0% { 
      opacity: 1;
      backdrop-filter: blur(8px);
    }
    100% { 
      opacity: 0;
      backdrop-filter: blur(0px);
    }
  }
  
  @keyframes paymentModalSlideIn {
    0% { 
      transform: translateY(100%) scale(0.95);
      opacity: 0;
    }
    50% {
      transform: translateY(50%) scale(0.98);
      opacity: 0.7;
    }
    100% { 
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
  
  @keyframes paymentModalSlideOut {
    0% { 
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    50% {
      transform: translateY(50%) scale(0.98);
      opacity: 0.7;
    }
    100% { 
      transform: translateY(100%) scale(0.95);
      opacity: 0;
    }
  }
  
  @keyframes paymentModalBounceIn {
    0% { 
      transform: translateY(100%) scale(0.8);
      opacity: 0;
    }
    60% {
      transform: translateY(-10%) scale(1.02);
      opacity: 0.9;
    }
    100% { 
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
  
  @keyframes paymentModalBounceOut {
    0% { 
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    40% {
      transform: translateY(-10%) scale(1.02);
      opacity: 0.9;
    }
    100% { 
      transform: translateY(100%) scale(0.8);
      opacity: 0;
    }
  }
  
  @keyframes paymentMethodButtonHover {
    0% { 
      transform: scale(1) translateY(0);
    }
    50% {
      transform: scale(1.02) translateY(-2px);
    }
    100% { 
      transform: scale(1.02) translateY(-2px);
    }
  }
  
  @keyframes paymentMethodButtonClick {
    0% { 
      transform: scale(1.02) translateY(-2px);
    }
    50% {
      transform: scale(0.98) translateY(0);
    }
    100% { 
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes paymentModalContentFadeIn {
    0% { 
      opacity: 0;
      transform: translateY(20px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes paymentModalCloseButtonHover {
    0% { 
      transform: scale(1) rotate(0deg);
    }
    50% {
      transform: scale(1.1) rotate(90deg);
    }
    100% { 
      transform: scale(1.1) rotate(90deg);
    }
  }
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("payment-modal-animations")
) {
  const style = document.createElement("style");
  style.id = "payment-modal-animations";
  style.textContent = paymentModalAnimationStyles;
  document.head.appendChild(style);
}

const PurchasePage = () => {
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(
    PaymentProvider.YOOKASSA,
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isPaymentModalClosing, setIsPaymentModalClosing] = useState(false);
  const [isProcessingBalancePayment, setIsProcessingBalancePayment] =
    useState(false);
  const [isProcessingYooKassaPayment, setIsProcessingYooKassaPayment] =
    useState(false);
  const [isProcessingCryptoPayment, setIsProcessingCryptoPayment] =
    useState(false);
  const [insufficientFundsData, setInsufficientFundsData] = useState<{
    requiredAmount: number;
    currentBalance: number;
    shortfall: number;
  } | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  useTelegramPage();
  const { trackEvent, trackError } = useAnalytics();

  const {
    tariffs,
    loading: tariffsLoading,
    error: tariffsError,
    fetchTariffs,
  } = useTariffs();
  const {
    purchaseResponse,
    loading: purchaseLoading,
    error: purchaseError,
    createPurchase,
    reset: resetPurchase,
  } = usePurchase();
  const {
    balancePurchaseResponse,
    loading: balanceLoading,
    error: balanceError,
    purchaseWithBalance,
    reset: resetBalance,
  } = useBalancePurchase();
  const { userInfo } = useUserContext();

  const { processPayment, checkPendingPayment } = useTelegramPayment();

  const openStatusWindow = (isSuccess: boolean, message?: string) => {
    const payload = `status=${isSuccess ? "success" : "error"}${message ? `; message=${message}` : ""}`;
    const url = "data:text/plain;charset=utf-8," + encodeURIComponent(payload);
    window.open(url, "_blank");
  };

  useEffect(() => {
    trackEvent(AnalyticsEvents.PAGE_VIEW("purchase"));
    fetchTariffs();
  }, [fetchTariffs, trackEvent]);

  useEffect(() => {
    const checkPending = async () => {
      try {
        await checkPendingPayment();
      } catch (error) {
        throw error;
      }
    };

    checkPending();
  }, [checkPendingPayment]);

  useEffect(() => {
    if (tariffs && tariffs.length > 0 && !selectedTariff) {
      const sixMonthTariff = tariffs.find((tariff) => tariff.months === 6);
      if (sixMonthTariff) {
        setSelectedTariff(sixMonthTariff);
      }
    }
  }, [tariffs, selectedTariff]);

  useEffect(() => {
    if (purchaseResponse) {
      const handlePayment = async () => {
        try {
          await processPayment(purchaseResponse);
          setTimeout(() => {
            resetPurchase();
            setIsProcessingYooKassaPayment(false);
            setIsProcessingCryptoPayment(false);
          }, 1000);
        } catch (error) {
          setIsProcessingYooKassaPayment(false);
          setIsProcessingCryptoPayment(false);
          if (
            typeof window !== "undefined" &&
            window.Telegram?.WebApp?.showAlert
          ) {
            window.Telegram.WebApp.showAlert(
              `Ошибка обработки платежа: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
            );
          } else {
            if (window.Telegram?.WebApp?.showAlert) {
              window.Telegram.WebApp.showAlert(
                `Ошибка обработки платежа: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
              );
            }
          }
          resetPurchase();
        }
      };

      handlePayment();
    }
  }, [purchaseResponse, processPayment, resetPurchase]);

  useEffect(() => {
    if (balancePurchaseResponse) {
      if (
        !balancePurchaseResponse.success &&
        !balancePurchaseResponse.message
      ) {
        openStatusWindow(false, "payment_failed");
        setTimeout(() => {
          resetBalance();
        }, 1000);
        return;
      }

      if (balancePurchaseResponse.success) {
        let message =
          "🔐 Оплата прошла успешно!\nСпасибо за доверие ❤️\n\nВаш VPN активирован ✅";

        if (balancePurchaseResponse.expiry_date) {
          const expiryDate = new Date(
            balancePurchaseResponse.expiry_date,
          ).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          message += `\nСрок действия: до ${expiryDate}`;
        }

        message +=
          "\n\nЕсли возникнут вопросы — наша поддержка всегда на связи!";

        setPaymentModal({
          isOpen: true,
          message: message,
          type: "success",
        });

        setTimeout(() => {
          window.location.reload();
        }, 2000);

        setTimeout(() => {
          resetBalance();
        }, 1000);
      } else {
        const errorMessage =
          balancePurchaseResponse.message || "Ошибка оплаты с баланса";
        setPaymentModal({
          isOpen: true,
          message: errorMessage,
          type: "error",
        });
        setTimeout(() => {
          resetBalance();
        }, 1000);
      }
    }
  }, [balancePurchaseResponse, userInfo, resetBalance]);

  useEffect(() => {
    if (balanceError) {
      setPaymentModal({
        isOpen: true,
        message: balanceError,
        type: "error",
      });
      setIsProcessingBalancePayment(false);
    }
  }, [balanceError]);

  const handleTariffSelect = (tariff: Tariff) => {
    trackEvent({
      action: "tariff_selected",
      category: "purchase",
      label: `${tariff.months} months`,
      value: tariff.price,
      customData: { tariffId: tariff.id, months: tariff.months },
    });
    setSelectedTariff(tariff);
  };

  const handleProceedToPayment = () => {
    if (selectedTariff) {
      trackEvent(
        AnalyticsEvents.BUTTON_CLICK("proceed_to_payment", "purchase"),
      );
      setShowPaymentModal(true);
      setIsPaymentModalClosing(false);
      setTimeout(() => setIsPaymentModalVisible(true), 10);
    }
  };

  const handlePurchase = async () => {
    if (!selectedTariff) return;

    if (selectedProvider === PaymentProvider.BALANCE) {
      const requiredAmount = selectedTariff.price;
      const currentBalance = userInfo?.balance || 0;

      if (currentBalance < requiredAmount) {
        const shortfall = requiredAmount - currentBalance;
        setInsufficientFundsData({
          requiredAmount,
          currentBalance,
          shortfall,
        });
        return;
      }
    }

    if (selectedProvider === PaymentProvider.YOOKASSA) {
      setIsProcessingYooKassaPayment(true);
    } else if (selectedProvider === PaymentProvider.CRYPTO) {
      setIsProcessingCryptoPayment(true);
    }

    try {
      await createPurchase({
        provider: selectedProvider,
        months: selectedTariff.months,
        currency:
          selectedProvider === PaymentProvider.CRYPTO ? "RUB" : undefined,
      });
    } catch (error) {
      if (selectedProvider === PaymentProvider.YOOKASSA) {
        setIsProcessingYooKassaPayment(false);
      } else if (selectedProvider === PaymentProvider.CRYPTO) {
        setIsProcessingCryptoPayment(false);
      }
      throw error;
    }
  };

  const handleInsufficientFundsClose = () => {
    setInsufficientFundsData(null);
  };

  const handleTopUpBalance = () => {
    setInsufficientFundsData(null);
    setSelectedProvider(PaymentProvider.YOOKASSA);
  };

  const closePaymentModal = () => {
    setPaymentModal({
      isOpen: false,
      message: "",
      type: "success",
    });
  };

  const closePaymentMethodModal = () => {
    setIsPaymentModalClosing(true);
    setIsPaymentModalVisible(false);
    setTimeout(() => {
      setShowPaymentModal(false);
      setIsPaymentModalClosing(false);
    }, 400);
  };

  if (tariffsLoading || tariffsError || !tariffs || tariffs.length === 0) {
    return (
      <div className="App App--scheme_ultima ultima">
        <div className="PurchasePage OrderPage flex flex-col w-full text-white">
          <div className="py-2 mt-2 flex items-center justify-center">
            <h1 className="text-2xl">Покупка подписки</h1>
            <div></div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <p className="text-center text-white/70 mb-4">
              Выберите подходящий тариф для вашей VPN подписки
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App App--scheme_ultima ultima">
      <div className="PurchasePage OrderPage flex flex-col w-full text-white">
        <div className="py-2 mt-2 flex items-center justify-center">
          <h1 className="text-2xl text-center">Покупка подписки</h1>
          <div></div>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <p className="text-center text-white/70 mb-4">
            Выберите подходящий тариф для вашей VPN подписки
          </p>
          <div className="OrderPage__buttons">
            {tariffs.map((tariff) => (
              <TariffCard
                key={tariff.id}
                tariff={tariff}
                isSelected={selectedTariff?.id === tariff.id}
                onSelect={handleTariffSelect}
              />
            ))}
          </div>

          <button
            onClick={handleProceedToPayment}
            disabled={!selectedTariff}
            className={`z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 px-4 min-w-20 gap-2 rounded-medium transition-transform-colors-opacity motion-reduce:transition-none Button OrderPage__buyButton shrink-0 border border-primary-50 text-white bg-primary-dark-900 mt-4 text-sm h-54 w-full ${
              !selectedTariff ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {selectedTariff
              ? `Оплатить ${selectedTariff.price} ₽`
              : "Выберите тариф"}
          </button>
        </div>

        {showPaymentModal && (
          <div
            className="fixed inset-0 z-40 flex items-end"
            onClick={closePaymentMethodModal}
            style={{
              animation: isPaymentModalClosing
                ? "paymentModalFadeOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                : "paymentModalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              background: isPaymentModalClosing
                ? "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)"
                : "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
              backdropFilter: isPaymentModalClosing ? "blur(0px)" : "blur(8px)",
              transition:
                "background 0.4s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              className="w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{
                animation: isPaymentModalClosing
                  ? "paymentModalBounceOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  : "paymentModalBounceIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isPaymentModalVisible
                  ? "translateY(0) scale(1)"
                  : "translateY(100%) scale(0.95)",
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                background:
                  "linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(30, 30, 30, 0.95) 100%)",
                backdropFilter: "blur(20px)",
                borderRadius: "24px 24px 0 0",
                boxShadow:
                  "0 -8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
              </div>

              <div className="px-6 pb-4">
                <div className="flex justify-between items-center">
                  <h3
                    className="text-xl font-bold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Способ оплаты
                  </h3>
                  <button
                    onClick={closePaymentMethodModal}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ease-out hover:scale-110"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      willChange: "transform",
                      backfaceVisibility: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.animation =
                        "paymentModalCloseButtonHover 0.3s ease-out";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.animation = "none";
                    }}
                  >
                    <span className="text-gray-300 text-lg">×</span>
                  </button>
                </div>
              </div>

              {selectedTariff && (
                <div className="px-6 pb-4 text-center">
                  <div className="text-white font-medium text-lg">
                    {selectedTariff.months === 1
                      ? "Месячная подписка"
                      : selectedTariff.months === 6
                        ? "Полугодовая подписка"
                        : selectedTariff.months === 12
                          ? "Годовая подписка"
                          : `Подписка на ${selectedTariff.months} мес.`}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    до{" "}
                    {new Date(
                      Date.now() +
                        selectedTariff.months * 30 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    • {selectedTariff.price} ₽
                  </div>
                  <div className="w-full h-px bg-gray-600 my-4"></div>
                </div>
              )}

              <div
                className="px-6"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                  paddingBottom: "15px",
                  opacity: 0,
                  transform: "translateY(20px)",
                  animation:
                    "paymentModalContentFadeIn 0.5s ease-out 0.2s forwards",
                  willChange: "opacity, transform",
                  backfaceVisibility: "hidden",
                }}
              >
                <button
                  onClick={async () => {
                    setSelectedProvider(PaymentProvider.STARS);
                    setTimeout(async () => {
                      try {
                        await createPurchase({
                          provider: PaymentProvider.STARS,
                          months: selectedTariff?.months || 0,
                          currency: undefined,
                        });
                      } catch (error) {
                        throw error;
                      }
                    }, 0);
                  }}
                  className="w-full p-4 rounded-2xl payment-method-button"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 193, 7, 0.1) 100%)",
                    border: "1px solid rgba(255, 215, 0, 0.3)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    willChange: "transform",
                    backfaceVisibility: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.animation =
                      "paymentMethodButtonHover 0.3s ease-out";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.animation = "none";
                    e.currentTarget.style.transform = "scale(1) translateY(0)";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.animation =
                      "paymentMethodButtonClick 0.2s ease-out";
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                        boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
                      }}
                    >
                      <span className="text-2xl">⭐</span>
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-white font-semibold text-lg">
                        Telegram Stars
                      </div>
                      <div className="text-gray-300 text-sm">
                        Быстрая оплата в Telegram
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    setSelectedProvider(PaymentProvider.BALANCE);
                    if (selectedTariff) {
                      setIsProcessingBalancePayment(true);
                      try {
                        await new Promise((resolve) =>
                          setTimeout(resolve, 3000),
                        );
                        await purchaseWithBalance(
                          selectedTariff.months,
                          BalanceType.REAL,
                        );
                      } catch (error) {
                        openStatusWindow(
                          false,
                          error instanceof Error ? error.message : "error",
                        );
                      } finally {
                        setIsProcessingBalancePayment(false);
                      }
                    }
                  }}
                  disabled={isProcessingBalancePayment}
                  className="w-full p-4 rounded-2xl payment-method-button"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(16, 185, 129, 0.1) 100%)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    willChange: "transform",
                    backfaceVisibility: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessingBalancePayment) {
                      e.currentTarget.style.animation =
                        "paymentMethodButtonHover 0.3s ease-out";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.animation = "none";
                    e.currentTarget.style.transform = "scale(1) translateY(0)";
                  }}
                  onMouseDown={(e) => {
                    if (!isProcessingBalancePayment) {
                      e.currentTarget.style.animation =
                        "paymentMethodButtonClick 0.2s ease-out";
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #22C55E 0%, #10B981 100%)",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      {isProcessingBalancePayment ? (
                        <div className="loading-spinner"></div>
                      ) : (
                        <span className="text-2xl">💰</span>
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-white font-semibold text-lg">
                        {isProcessingBalancePayment
                          ? "Обработка..."
                          : "Оплата с баланса"}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {isProcessingBalancePayment
                          ? "Пожалуйста, подождите"
                          : "Списать из баланса аккаунта"}
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedProvider(PaymentProvider.YOOKASSA);
                    handlePurchase();
                  }}
                  disabled={isProcessingYooKassaPayment}
                  className="w-full p-4 rounded-2xl payment-method-button"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    willChange: "transform",
                    backfaceVisibility: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.animation =
                      "paymentMethodButtonHover 0.3s ease-out";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.animation = "none";
                    e.currentTarget.style.transform = "scale(1) translateY(0)";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.animation =
                      "paymentMethodButtonClick 0.2s ease-out";
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                        }}
                      >
                        {isProcessingYooKassaPayment ? (
                          <div className="loading-spinner"></div>
                        ) : (
                          <span className="text-2xl">💳</span>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold text-lg">
                          {isProcessingYooKassaPayment
                            ? "Обработка..."
                            : "YooKassa"}
                        </div>
                        <div className="text-gray-300 text-sm">
                          {isProcessingYooKassaPayment
                            ? "Пожалуйста, подождите"
                            : "Карты, СБП, SberPay"}
                        </div>
                      </div>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(5px)",
                      }}
                    >
                      <span className="text-gray-300 text-lg">→</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    setSelectedProvider(PaymentProvider.CRYPTO);
                    setIsProcessingCryptoPayment(true);
                    setTimeout(async () => {
                      try {
                        await createPurchase({
                          provider: PaymentProvider.CRYPTO,
                          months: selectedTariff?.months || 0,
                          currency: "USDT",
                        });
                      } catch (error) {
                        setIsProcessingCryptoPayment(false);
                      }
                    }, 0);
                  }}
                  disabled={isProcessingCryptoPayment}
                  className="w-full p-4 rounded-2xl payment-method-button"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)",
                    border: "1px solid rgba(251, 146, 60, 0.3)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, #FB923C 0%, #F97316 100%)",
                          boxShadow: "0 4px 12px rgba(251, 146, 60, 0.3)",
                        }}
                      >
                        {isProcessingCryptoPayment ? (
                          <div className="loading-spinner"></div>
                        ) : (
                          <span className="text-2xl">₿</span>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold text-lg">
                          {isProcessingCryptoPayment
                            ? "Обработка..."
                            : "Криптовалюта"}
                        </div>
                        <div className="text-gray-300 text-sm">
                          {isProcessingCryptoPayment
                            ? "Пожалуйста, подождите"
                            : "USDT, Bitcoin, Ethereum"}
                        </div>
                      </div>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(5px)",
                      }}
                    >
                      <span className="text-gray-300 text-lg">→</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={closePaymentModal}
        message={paymentModal.message}
        type={paymentModal.type}
      />
    </div>
  );
};

export default PurchasePage;

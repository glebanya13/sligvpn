import { useEffect, useState } from "react";
import BalanceHistoryList from "../../components/BalanceHistoryList";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useReferralInfo } from "../../hooks/useApi";
import { useUserContext } from "../../contexts/user.context";
import { useBalanceHistory } from "../../hooks/useBalanceHistory";
import { usePaymentHistory } from "../../hooks/usePaymentHistory";
import { CopyType, Currency } from "../../helpers/enum";
import { useTelegramPage } from "../../hooks/useTelegramPage";
import {
  copyIcon as CopyIcon,
  chevronDownIcon as ChevronDownIcon,
  chevronUpIcon as ChevronUpIcon,
  creditCardIcon as CreditCardIcon,
  calendarIcon as CalendarIcon,
  checkIcon as CheckIcon,
  chevronRightIcon as ChevronRightIcon,
  trashIcon as TrashIcon,
  listIcon as ListIcon,
} from "../../components/icons";
import "./style.css";

const profileModalAnimationStyles = `
  @keyframes profileModalFadeIn {
    0% { 
      opacity: 0;
      backdrop-filter: blur(0px);
    }
    100% { 
      opacity: 1;
      backdrop-filter: blur(8px);
    }
  }
  
  @keyframes profileModalFadeOut {
    0% { 
      opacity: 1;
      backdrop-filter: blur(8px);
    }
    100% { 
      opacity: 0;
      backdrop-filter: blur(0px);
    }
  }
  
  @keyframes profileModalSlideIn {
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
  
  @keyframes profileModalSlideOut {
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
  
  @keyframes profileModalBounceIn {
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
  
  @keyframes profileModalBounceOut {
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
  
  @keyframes profileModalCloseButtonHover {
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
  
  @keyframes profileModalContentFadeIn {
    0% { 
      opacity: 0;
      transform: translateY(20px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes profileModalContentFadeOut {
    0% { 
      opacity: 1;
      transform: translateY(0);
    }
    100% { 
      opacity: 0;
      transform: translateY(-20px);
    }
  }
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("profile-modal-animations")
) {
  const style = document.createElement("style");
  style.id = "profile-modal-animations";
  style.textContent = profileModalAnimationStyles;
  document.head.appendChild(style);
}

const ProfilePage = () => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  useTelegramPage();
  const { trackEvent } = useAnalytics();
  const {
    userInfo,
    loading: userLoading,
    error: userError,
    fetchUserInfo,
  } = useUserContext();
  const {
    referralInfo,
    loading: referralLoading,
    error: referralError,
    fetchReferralInfo,
  } = useReferralInfo();
  const {
    history: paymentHistory,
    loading: paymentHistoryLoading,
    error: paymentHistoryError,
    pagination: paymentHistoryPagination,
    loadMore: loadMorePaymentHistory,
  } = usePaymentHistory();
  const {
    history: balanceHistory,
    loading: balanceHistoryLoading,
    error: balanceHistoryError,
    pagination: balanceHistoryPagination,
    loadMore: loadMoreBalanceHistory,
  } = useBalanceHistory();

  const referralHistory: any[] = [];
  const referralHistoryLoading = false;
  const referralHistoryError = null;

  const copyToClipboard = (text: string, type: CopyType) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === CopyType.ID) setCopiedId(true);
      if (type === CopyType.LINK) setCopiedLink(true);
      if (type === CopyType.REFERRAL) setCopiedReferral(true);

      setTimeout(() => {
        if (type === CopyType.ID) setCopiedId(false);
        if (type === CopyType.LINK) setCopiedLink(false);
        if (type === CopyType.REFERRAL) setCopiedReferral(false);
      }, 2000);
    });
  };

  const openModal = (modalName: string) => {
    setActiveModal(modalName);
    setIsModalClosing(false);
    setTimeout(() => setIsModalVisible(true), 10);
    if (modalName === "referral") {
    }
  };

  const closeModal = () => {
    setIsModalClosing(true);
    setIsModalVisible(false);
    setTimeout(() => {
      setActiveModal(null);
      setIsModalClosing(false);
    }, 400);
  };

  useEffect(() => {
    fetchUserInfo();
    fetchReferralInfo();
  }, [fetchUserInfo, fetchReferralInfo]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Нет активной подписки";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Неверный формат даты";
    }
  };

  const formatBalance = (balance: number) => {
    return `${balance.toFixed(2)} ₽`;
  };

  if (userLoading) {
    return (
      <div className="App App--scheme_ultima">
        <div className="ProfilePage">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-white/70">Загрузка профиля...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="App App--scheme_ultima">
        <div className="ProfilePage">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-400 mb-4">Ошибка загрузки профиля</p>
              <p className="text-white/70 text-sm mb-4">{userError}</p>
              <button
                onClick={fetchUserInfo}
                className="Button bg-primary text-white"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="App App--scheme_ultima">
        <div className="ProfilePage">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-white/70">Данные пользователя не найдены</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App App--scheme_ultima">
      <div className="ProfilePage">
        <div
          className="w-full text-center pt-2 pb-2"
          style={{ background: "transparent" }}
        >
          <div
            className="mx-auto"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: 4,
              width: 320,
              maxWidth: "90%",
            }}
          >
            <p
              className="text-lg truncate"
              style={{ width: "100%" }}
              title={
                window.Telegram?.WebApp?.initDataUnsafe?.user?.username
                  ? `@${window.Telegram.WebApp.initDataUnsafe.user.username}`
                  : window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name
                    ? window.Telegram.WebApp.initDataUnsafe.user.first_name
                    : `Пользователь #${userInfo.user_id}`
              }
            >
              {window.Telegram?.WebApp?.initDataUnsafe?.user?.username
                ? `@${window.Telegram.WebApp.initDataUnsafe.user.username}`
                : window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name
                  ? window.Telegram.WebApp.initDataUnsafe.user.first_name
                  : `Пользователь #${userInfo.user_id}`}
            </p>

            <button
              className={`Snippet Snippet--user-id text-sm text-default-light ${copiedId ? "copied" : ""}`}
              onClick={() =>
                copyToClipboard(`id: ${userInfo.user_id}`, CopyType.ID)
              }
              style={{
                fontFamily: "inherit",
                width: "auto",
                display: "flex",
                alignItems: "center",
                margin: "auto",
                gap: 6,
                padding: 0,
              }}
            >
              <div className="truncate">id: {userInfo.user_id}</div>
              <div className="Snippet__icon">
                <CopyIcon
                  width={18}
                  height={18}
                  className="lucide lucide-copy opacity-100"
                />
                <CheckIcon
                  width={18}
                  height={18}
                  className="lucide lucide-check opacity-0"
                />
              </div>
            </button>
          </div>

          <p className="text-xl mt-1">
            Баланс:{" "}
            <span className="text-green">
              {formatBalance(userInfo.balance)}
            </span>
          </p>

          <p className="text-sm mt-1 text-white/70">
            Подписка: {formatDate(userInfo.subscription_until)}
          </p>
        </div>

        <div className="relative flex flex-col w-full p-0 gap-0 bg-dark-40 overflow-visible rounded-medium">
          <ul
            className="w-full flex flex-col gap-0.5 outline-none"
            role="listbox"
          >
            {/* <Link
              to="/profile/money"
              className="list-item flex group items-center justify-between relative w-full box-border subpixel-antialiased cursor-pointer gap-3"
              role="option"
            >
              <div className="bg-success/10 text-success flex items-center rounded-small justify-center">
                <CreditCardIcon
                  className="lucide lucide-credit-card"
                />
              </div>
              <span data-label="true" className="truncate">
                Оплата
              </span>
            </Link> */}

            <div
              className="list-item disabled flex items-center justify-between relative w-full box-border subpixel-antialiased cursor-not-allowed gap-3 opacity-50"
              style={{ pointerEvents: "none" }}
              role="option"
            >
              <div className="bg-gray-500/10 text-gray-500 flex items-center rounded-small justify-center">
                <CreditCardIcon className="lucide lucide-credit-card" />
              </div>
              <span data-label="true" className="truncate">
                Оплата
              </span>
              <span className="text-gray-500 text-sm">Скоро</span>
            </div>

            <li
              className="list-item flex group items-center justify-between relative w-full box-border subpixel-antialiased cursor-pointer gap-3"
              id="transactions"
              role="option"
              onClick={() => openModal("transactions")}
            >
              <div className="bg-cyan-500/10 text-cyan-400 flex items-center rounded-small justify-center">
                <ListIcon className="lucide lucide-list" />
              </div>
              <span data-label="true" className="truncate">
                Мои транзакции
              </span>
            </li>

            <li
              className="list-item flex group items-center justify-between relative w-full box-border subpixel-antialiased cursor-pointer gap-3"
              id="referral-program"
              role="option"
              onClick={() => openModal("referral")}
            >
              <div className="bg-purple-500/15 text-purple-300 flex items-center rounded-small justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-handshake"
                >
                  <path d="m11 17 2 2a1 1 0 1 0 3-3"></path>
                  <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 1 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"></path>
                  <path d="m21 3 1 11h-2"></path>
                  <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"></path>
                  <path d="M3 4h8"></path>
                </svg>
              </div>
              <span data-label="true" className="truncate">
                Реферальная программа
              </span>
            </li>

            <a
              href="https://t.me/SligVPNHelp"
              target="_blank"
              rel="noreferrer"
              className="list-item flex group items-center justify-between relative w-full box-border subpixel-antialiased cursor-pointer gap-3"
              role="option"
            >
              <div className="bg-warning/10 text-warning flex items-center rounded-small justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-message-square-more"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <path d="M8 10h.01"></path>
                  <path d="M12 10h.01"></path>
                  <path d="M16 10h.01"></path>
                </svg>
              </div>
              <span data-label="true" className="truncate">
                Связаться с поддержкой
              </span>
            </a>

            <li
              className="list-item flex group items-center justify-between relative w-full box-border subpixel-antialiased cursor-pointer gap-3"
              id="user-agreement"
              role="option"
              onClick={() => openModal("agreement")}
            >
              <div className="bg-danger/10 text-danger-500 flex items-center rounded-small justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-book"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"></path>
                </svg>
              </div>
              <span data-label="true" className="truncate">
                Пользовательское соглашение
              </span>
            </li>
          </ul>
        </div>

        <div className="w-full bg-dark-40 p-4 rounded-xl">
          <p className="text-sm mb-3">Ссылка на подписку для ручного ввода:</p>
          {(() => {
            const activeConfig =
              userInfo?.configs?.length > 0
                ? userInfo.configs.find((config) => config.is_active) || null
                : null;

            if (!activeConfig) {
              return (
                <div className="text-center py-4">
                  <div className="text-white/50 text-sm mb-2">
                    У вас нет VPN конфигураций
                  </div>
                  <div className="text-white/30 text-xs">
                    Купите подписку, чтобы получить конфигурацию для подключения
                  </div>
                </div>
              );
            }

            const isExpired =
              activeConfig.expiry_date &&
              new Date(activeConfig.expiry_date) < new Date();

            if (isExpired) {
              return (
                <div className="text-center py-4">
                  <div className="text-red-400 text-sm mb-2">
                    Конфигурация истекла
                  </div>
                  <div className="text-white/30 text-xs">
                    Купите новую подписку для получения актуальной конфигурации
                  </div>
                </div>
              );
            }

            return (
              <div>
                <button
                  className={`Snippet bg-primary-20 ${copiedLink ? "copied" : ""}`}
                  onClick={() =>
                    copyToClipboard(activeConfig.config_link, CopyType.LINK)
                  }
                >
                  <div
                    className="truncate"
                    style={{ maxWidth: 280 }}
                    title={activeConfig.config_link}
                  >
                    {activeConfig.config_link}
                  </div>
                  <div className="Snippet__icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-copy opacity-100"
                    >
                      <rect
                        width="14"
                        height="14"
                        x="8"
                        y="8"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check opacity-0"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                </button>

                {/* Информация о сроке действия */}
                {activeConfig.expiry_date && (
                  <div className="mt-2 text-xs text-white/60">
                    Действует до:{" "}
                    {new Date(activeConfig.expiry_date).toLocaleDateString(
                      "ru-RU",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <button
          className="Button text-white"
          onClick={() => {
            const hasActiveSubscription =
              userInfo?.subscription_until &&
              new Date(userInfo.subscription_until) > new Date();
            const hasConfigs = userInfo?.configs && userInfo.configs.length > 0;

            if (hasActiveSubscription || hasConfigs) {
              window.open("https://teletype.in/@sligvpn/main", "_blank");
            } else {
              trackEvent({
                action: "instruction_access_denied",
                category: "subscription",
                label: "no_subscription",
                customData: {
                  hasSubscription: false,
                  hasConfigs: false,
                  userTriedToAccessInstruction: true,
                },
              });

              if (
                typeof window !== "undefined" &&
                window.Telegram?.WebApp?.showAlert
              ) {
                window.Telegram.WebApp.showAlert(
                  "У вас еще нет активной подписки. Сначала купите подписку, а затем переходите к настройке VPN.",
                );
              } else {
                if (window.Telegram?.WebApp?.showAlert) {
                  window.Telegram.WebApp.showAlert(
                    "У вас еще нет активной подписки. Сначала купите подписку, а затем переходите к настройке VPN.",
                  );
                }
              }
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-monitor-smartphone"
          >
            <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8"></path>
            <path d="M10 19v-3.96 3.15"></path>
            <path d="M7 19h5"></path>
            <rect width="6" height="10" x="16" y="12" rx="2"></rect>
          </svg>
          Инструкция для всех платформ
        </button>

        {/* Модальные окна */}
        {activeModal === "agreement" && (
          <div
            className="profile-modal-overlay open"
            style={{
              animation: isModalClosing
                ? "profileModalFadeOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                : "profileModalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              background: isModalClosing
                ? "rgba(0, 0, 0, 0)"
                : "rgba(0, 0, 0, 0.7)",
              backdropFilter: isModalClosing ? "blur(0px)" : "blur(8px)",
              transition:
                "background 0.4s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <section
              role="dialog"
              tabIndex={-1}
              className="profile-modal-dialog open"
              aria-modal="true"
              aria-labelledby="modal-title-user-agreement"
              style={{
                animation: isModalClosing
                  ? "profileModalBounceOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  : "profileModalBounceIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isModalVisible
                  ? "translateY(0) scale(1)"
                  : "translateY(100%) scale(0.95)",
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <button
                role="button"
                aria-label="Close"
                className="profile-modal-close"
                type="button"
                onClick={closeModal}
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  focusable="false"
                  height="1em"
                  role="presentation"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="1em"
                >
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
              <header className="profile-modal-header">
                Пользовательское соглашение
              </header>
              <div className="profile-modal-content">
                <div className="flex flex-col gap-2">
                  <h2 className="font-medium">Условия использования</h2>
                  <p className="text-sm text-white/80">
                    Используя SligVPN, вы автоматически соглашаетесь с этими
                    условиями использования и обязуетесь не нарушать
                    законодательство Российской Федерации или других государств.
                  </p>
                  <h2 className="font-medium">Сервис</h2>
                  <p className="text-sm text-white/80">
                    VPN-сервис обеспечивает конфиденциальность личной информации
                    путем шифрования и анонимизации метаданных пользователя,
                    скрывая его IP-адрес. <br />
                    Эти адреса используют множество других пользователей, что не
                    только обеспечивает конфиденциальность для каждого из них,
                    но и затрудняет определение характера их деятельности.
                    <br />
                    Мы не изменяем, не перенаправляем и не внедряемся в
                    пользовательский трафик.
                  </p>
                  <h2 className="font-medium">Демо период</h2>
                  <p className="text-sm text-white/80">
                    Всем пользователям доступен демо период в течение трех дней
                    с момента авторизации в приложении.
                  </p>
                  <h2 className="font-medium">
                    Подписка и автоматическое продление
                  </h2>
                  <p className="text-sm text-white/80">
                    Оплачивая подписку, вы соглашаетесь на автоматическое
                    продление.
                    <br />
                    Уведомление о том, что подписка закончится, приходит за один
                    день до окончания подписки.
                    <br />
                    Автоматическое продление можно отключить в любой момент в
                    разделе «Профиль» → «Оплата».
                  </p>
                  <h2 className="font-medium">Изменение стоимости подписки</h2>
                  <p className="text-sm text-white/80">
                    Мы оставляем за собой право изменять стоимость подписки.{" "}
                    <br /> В случае повышения стоимости более чем на 10%, вы
                    будете уведомлены заранее. <br />
                    Изменения вступают в силу со следующего платежного периода.
                  </p>
                  <h2 className="font-medium">Политика возврата</h2>
                  <p className="text-sm text-white/80">
                    Условия возврата: вы можете запросить возврат средств, если
                    полученные услуги были некачественными или не предоставлены
                    в соответствии с условиями.
                    <br />
                    Процедура возврата: Для запроса возврата, свяжитесь с нашей
                    службой поддержки по указанным контактным данным. Мы
                    рассмотрим ваш запрос и произведем возврат средств.
                    <br />
                    Сроки возврата: Мы рассмотрим ваш запрос в течение дня. Срок
                    исполнения возврата зависит от вашего банка.
                  </p>
                  <h2 className="font-medium">Конфиденциальность</h2>
                  <p className="text-sm text-white/80">
                    Мы полностью сохраняем вашу анонимность при использовании
                    нашего сервиса.
                    <br />
                    Поэтому мы не собираем и не храним данные о вашей
                    онлайн-активности и не передаем их третьим сторонам.
                    <br />
                    Мы применяем передовые методы шифрования для защиты вашей
                    информации.
                  </p>
                  <h2 className="font-medium">Отказ от ответственности</h2>
                  <p className="text-sm text-white/80">
                    Мы оставляем за собой право изменять сервис, обновляя наше
                    программное обеспечение или внося изменения в определенные
                    функции.
                    <br />
                    Мы стремимся минимизировать сбои и ошибки. Несмотря на наши
                    усилия, сервис предоставляется на условиях «как есть» и «по
                    мере доступности».
                    <br />
                    Вы несете единоличную ответственность за использование вами
                    сервиса.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeModal === "referral" && (
          <div
            className="profile-modal-overlay open"
            style={{
              animation: isModalClosing
                ? "profileModalFadeOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                : "profileModalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              background: isModalClosing
                ? "rgba(0, 0, 0, 0)"
                : "rgba(0, 0, 0, 0.7)",
              backdropFilter: isModalClosing ? "blur(0px)" : "blur(8px)",
              transition:
                "background 0.4s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <section
              role="dialog"
              tabIndex={-1}
              className="profile-modal-dialog open"
              aria-modal="true"
              aria-labelledby="modal-title-referral-program"
              style={{
                animation: isModalClosing
                  ? "profileModalBounceOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  : "profileModalBounceIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isModalVisible
                  ? "translateY(0) scale(1)"
                  : "translateY(100%) scale(0.95)",
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <button
                role="button"
                aria-label="Close"
                className="profile-modal-close"
                type="button"
                onClick={closeModal}
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  focusable="false"
                  height="1em"
                  role="presentation"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="1em"
                >
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
              <header className="profile-modal-header">
                Реферальная программа
              </header>
              <div className="profile-modal-content">
                <div className="flex flex-col gap-3">
                  <div className="bg-white/5 px-4 py-3 rounded-xl text-sm">
                    <p>
                      За каждого приглашенного друга вы получаете до 50% со всех
                      его пополнений.
                      <br />
                      Например, если ваш друг продлит подписку на 1 год, вы
                      получите до 894р.
                    </p>
                    <hr
                      className="shrink-0 bg-divider border-none w-full h-divider my-2"
                      role="separator"
                    />
                    <p className="text-primary font-semibold">
                      Друзей приглашено: {referralInfo?.invited || 0}
                    </p>
                  </div>
                  <p className="mb-2 mt-4">Ваша реферальная ссылка:</p>
                  {(() => {
                    const referralLink =
                      "https://t.me/SligVPN_bot?start=Y0G4WFL2";
                    return (
                      <button
                        className={`Snippet ${copiedReferral ? "copied" : ""}`}
                        onClick={() =>
                          copyToClipboard(referralLink, CopyType.REFERRAL)
                        }
                      >
                        <div className="truncate">{referralLink}</div>
                        <div className="Snippet__icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-copy opacity-100"
                          >
                            <rect
                              width="14"
                              height="14"
                              x="8"
                              y="8"
                              rx="2"
                              ry="2"
                            ></rect>
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                          </svg>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-check opacity-0"
                          >
                            <path d="M20 6 9 17l-5-5"></path>
                          </svg>
                        </div>
                      </button>
                    );
                  })()}
                  <p className="mb-4 mt-4">Реферальные начисления:</p>
                  <BalanceHistoryList
                    history={balanceHistory}
                    loading={balanceHistoryLoading}
                    error={balanceHistoryError}
                    onLoadMore={loadMoreBalanceHistory}
                    hasMore={balanceHistoryPagination?.has_more || false}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {activeModal === "transactions" && (
          <div
            className="profile-modal-overlay open"
            style={{
              animation: isModalClosing
                ? "profileModalFadeOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                : "profileModalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              background: isModalClosing
                ? "rgba(0, 0, 0, 0)"
                : "rgba(0, 0, 0, 0.7)",
              backdropFilter: isModalClosing ? "blur(0px)" : "blur(8px)",
              transition:
                "background 0.4s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <section
              role="dialog"
              tabIndex={-1}
              className="profile-modal-dialog open"
              aria-modal="true"
              aria-labelledby="modal-title-transactions"
              style={{
                animation: isModalClosing
                  ? "profileModalBounceOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  : "profileModalBounceIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isModalVisible
                  ? "translateY(0) scale(1)"
                  : "translateY(100%) scale(0.95)",
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <button
                role="button"
                aria-label="Close"
                className="profile-modal-close"
                type="button"
                onClick={closeModal}
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  focusable="false"
                  height="1em"
                  role="presentation"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="1em"
                >
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
              <header className="profile-modal-header">Мои транзакции</header>
              <div className="profile-modal-content">
                <BalanceHistoryList
                  history={paymentHistory}
                  loading={paymentHistoryLoading}
                  error={paymentHistoryError}
                  onLoadMore={loadMorePaymentHistory}
                  hasMore={paymentHistoryPagination?.has_more || false}
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

import { memo, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/client";
import frog from "../../assets/frog.svg";
import {
  messageIcon as MessageIcon,
  settingsIcon as SettingsIcon,
  unplugIcon as UnplugIcon,
  userIcon as UserIcon,
} from "../../components/icons";
import FirstRunModal from "../../components/FirstRunModal";
import { useUserContext } from "../../contexts/user.context";
import { useDeviceType } from "../../hooks/useDeviceType";
import { useAnalytics, AnalyticsEvents } from "../../hooks/useAnalytics";
import "./style.css";

const Logo = memo(() => (
  <div className="HomePage__logo">
    <div className="ripple-container">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="ripple" />
      ))}
    </div>
    <div className="logo-text">SligVPN</div>
  </div>
));

Logo.displayName = "Logo";

const FrogImage = memo(() => (
  <div className="frog-container">
    <img src={frog} alt="Frog" className="frog-image" />
  </div>
));

FrogImage.displayName = "FrogImage";

const HomePage = () => {
  const deviceType = useDeviceType();
  const {
    userInfo,
    loading: userLoading,
    error: userError,
    fetchUserInfo,
  } = useUserContext();
  const { trackEvent, trackError, setUserId } = useAnalytics();
  const [showFirstRunModal, setShowFirstRunModal] = useState(false);
  const [hasSeenFirstRunModal, setHasSeenFirstRunModal] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    trackEvent(AnalyticsEvents.PAGE_VIEW("home"));

    fetchUserInfo();
  }, [fetchUserInfo, trackEvent]);

  useEffect(() => {
    if (userInfo?.user_id) {
      setUserId(userInfo.user_id);
    }
  }, [userInfo?.user_id, setUserId]);

  useEffect(() => {
    if (userError) {
      trackError({
        error: userError,
        component: "HomePage",
        action: "fetchUserInfo",
        userId: userInfo?.user_id,
      });
    }
  }, [userError, trackError, userInfo?.user_id]);

  useEffect(() => {
    if (
      userInfo &&
      (!userInfo.configs || userInfo.configs.length === 0) &&
      !hasSeenFirstRunModal
    ) {
      const timer = setTimeout(() => {
        setShowFirstRunModal(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [userInfo, hasSeenFirstRunModal]);

  const handleCloseFirstRunModal = async () => {
    trackEvent(AnalyticsEvents.MODAL_CLOSED("first_run"));
    setShowFirstRunModal(false);
    setHasSeenFirstRunModal(true);

    if (userInfo && !userInfo.webapp_preview_opened) {
      try {
        await apiClient.markPreviewOpened(true);
        fetchUserInfo();
      } catch (error) {
        trackError({
          error: error instanceof Error ? error.message : "Unknown error",
          component: "HomePage",
          action: "markPreviewOpened",
          userId: userInfo?.user_id,
        });
        throw error;
      }
    }
  };

  const handleSetupClick = () => {
    trackEvent(AnalyticsEvents.BUTTON_CLICK("setup", "home"));

    const hasActiveSubscription =
      userInfo?.subscription_until &&
      new Date(userInfo.subscription_until) > new Date();
    const hasConfigs = userInfo?.configs && userInfo.configs.length > 0;

    if (hasActiveSubscription || hasConfigs) {
      setIsExiting(true);
    } else {
      trackEvent({
        action: "setup_access_denied",
        category: "subscription",
        label: "no_subscription",
        customData: {
          hasSubscription: false,
          hasConfigs: false,
          userTriedToAccessSetup: true,
        },
      });

      if (typeof window !== "undefined" && window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(
          "У вас еще нет активной подписки. Сначала купите подписку, а затем переходите к настройке VPN."
        );
      } else {
        if (window.Telegram?.WebApp?.showAlert) {
          window.Telegram.WebApp.showAlert(
            "У вас еще нет активной подписки. Сначала купите подписку, а затем переходите к настройке VPN."
          );
        }
      }
    }
  };

  const purchaseRoute = useMemo(
    () =>
      ({
        ios: "/setup/android",
        android: "/setup/android",
        desktop: "/setup/android",
      })[deviceType],
    [deviceType]
  );

  const purchaseText = useMemo(
    () =>
      ({
        ios: "для iOS",
        android: "для Android",
        desktop: "для Desktop",
      })[deviceType],
    [deviceType]
  );

  const getPurchaseButtonText = () => {
    if (!userInfo?.subscription_until) {
      return "Купить подписку";
    }

    const subscriptionDate = new Date(userInfo.subscription_until);
    const now = new Date();

    if (subscriptionDate > now) {
      return "Продлить подписку";
    }

    return "Купить подписку";
  };

  const formatBalance = (balance: number) => {
    return `${balance.toFixed(2)} ₽`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "нет активной подписки";

    try {
      const date = new Date(dateString);
      return `до ${date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`;
    } catch {
      return "неверный формат даты";
    }
  };

  const getTrialEndDate = () => {
    const trialDate = new Date();
    trialDate.setDate(trialDate.getDate() + 7); // 7 дней пробного периода
    return trialDate.toISOString();
  };

  const getDisplayDate = () => {
    if (userInfo?.subscription_until) {
      const subscriptionDate = new Date(userInfo.subscription_until);
      const now = new Date();

      if (subscriptionDate > now) {
        return {
          text: formatDate(userInfo.subscription_until),
          color: "#10b981",
        }; // green-500
      } else {
        return {
          text: formatDate(userInfo.subscription_until),
          color: "#ef4444",
        }; // red-500
      }
    } else if (userInfo?.configs && userInfo.configs.length > 0) {
      return { text: formatDate(getTrialEndDate()), color: "#f59e0b" }; // yellow-500
    } else {
      return { text: "Нужна активация", color: "#9ca3af" }; // gray-400
    }
  };

  const getSubscriptionStatus = () => {
    if (userInfo?.subscription_until) {
      const subscriptionDate = new Date(userInfo.subscription_until);
      const now = new Date();

      if (subscriptionDate > now) {
        return { text: "подписка активна", color: "#10b981" }; // green-500
      } else {
        return { text: "подписка истекла", color: "#ef4444" }; // red-500
      }
    } else if (userInfo?.configs && userInfo.configs.length > 0) {
      return { text: "пробный период", color: "#f59e0b" }; // yellow-500
    } else {
      return { text: "", color: "#9ca3af" }; // gray-400 - пустая строка, так как дата уже показывает "Нужна настройка"
    }
  };

  if (userError) {
    return (
      <div className="App App--scheme_ultima">
        <div className="HomePage">
          <div className="HomePage__top">
            <Logo />
          </div>
          <div className="HomePage__bottom rounded-2xl">
            <div className="HomePageBottom">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-red-400 mb-4">Ошибка загрузки данных</p>
                  <p className="text-white/70 text-sm mb-4">{userError}</p>
                  <div className="flex items-center justify-center gap-2">
                    <a
                      href="https://t.me/SligVPNHelp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="Button1 HomePageBottom__bodyButton"
                    >
                      Поддержка
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userLoading && !userInfo) {
    return (
      <div className="App App--scheme_ultima">
        <div className="HomePage">
          <div className="HomePage__top">
            <Logo />
          </div>
          <div className="HomePage__bottom rounded-2xl">
            <div className="HomePageBottom">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-white/70 mb-4">
                    Данные пользователя не найдены
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={fetchUserInfo}
                      className="Button1 HomePageBottom__bodyButton"
                    >
                      Обновить
                    </button>
                    <a
                      href="https://t.me/SligVPNHelp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="Button1 HomePageBottom__bodyButton"
                    >
                      Поддержка
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App App--scheme_ultima">
      <div className="HomePage">
        <div className="HomePage__top">
          <Logo />
        </div>
        <div className="HomePage__frogWrap">
          <FrogImage />
        </div>
        <div className="HomePage__bottom rounded-2xl">
          <div className="HomePageBottom">
            <div className="HomePageBottom__head">
              <div className="HomePageBottom__headRow">
                <div className="text-right text-2xl font-light leading-4">
                  {userInfo?.subscription_until ? "Premium" : "Standard"}
                </div>
              </div>
              <div
                className="HomePageBottom__headRow"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div
                  className="text-lg font-bold"
                  style={{ lineHeight: "20px", minWidth: "120px" }}
                >
                  Баланс:{" "}
                  <span className="text-green">
                    {userLoading
                      ? "..."
                      : userInfo
                        ? formatBalance(userInfo.balance)
                        : "0 ₽"}
                  </span>
                  <br />
                  <span style={{ color: "gray" }}>
                    {userInfo?.subscription_until ? "online" : "offline"}
                  </span>
                </div>
                <div
                  className="text-right text-primary subscription-info"
                  aria-hidden="true"
                  style={{ lineHeight: "20px", minWidth: "140px" }}
                >
                  <span
                    className="text-default font-bold"
                    style={{ color: "white" }}
                  >
                    {getDisplayDate().text}
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: getSubscriptionStatus().color }}
                  >
                    {getSubscriptionStatus().text}
                  </span>
                </div>
              </div>
            </div>
            <div className="HomePageBottom__body">
              <Link
                to="/purchase"
                className="Button1 HomePageBottom__bodyButton"
                onClick={() =>
                  trackEvent(AnalyticsEvents.BUTTON_CLICK("purchase", "home"))
                }
              >
                <UnplugIcon width={24} height={24} />
                <span className="mr-auto">{getPurchaseButtonText()}</span>
                <span className="text-green">от 149 ₽</span>
              </Link>
              <div className="flex flex-col">
                <Link
                  to={purchaseRoute}
                  id="setup-button"
                  className="Button1 HomePageSetupButton HomePageBottom__bodyButton HomePageSetupButton--animated"
                  onClick={handleSetupClick}
                >
                  <SettingsIcon width={24} height={24} />
                  <span className="mr-auto truncate">
                    Установка и настройка
                  </span>
                  <span className="HomePageBottom__sepupButtonDeviceIcon--text text-green">
                    {purchaseText}
                  </span>
                </Link>
              </div>
              <div className="HomePageBottom__row">
                <Link
                  to="/profile"
                  className="Button1 HomePageBottom__bodyButton"
                  onClick={() =>
                    trackEvent(AnalyticsEvents.BUTTON_CLICK("profile", "home"))
                  }
                >
                  <UserIcon width={24} height={24} />
                  <span className="mr-auto">Профиль</span>
                </Link>
                <a
                  href="https://t.me/SligVPNHelp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="Button1 HomePageBottom__bodyButton"
                  onClick={() =>
                    trackEvent(AnalyticsEvents.BUTTON_CLICK("support", "home"))
                  }
                >
                  <MessageIcon width={24} height={24} />
                  <span className="mr-auto">Поддержка</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FirstRunModal
        isOpen={showFirstRunModal}
        onClose={handleCloseFirstRunModal}
      />
    </div>
  );
};

export default memo(HomePage);

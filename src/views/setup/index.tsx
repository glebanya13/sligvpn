import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/user.context";
import { useVpnConfig } from "../../hooks/useVpnConfig";
import {
  unplugIcon as UnplugIcon,
  cloudDownloadIcon as CloudDownloadIcon,
  circleFadingPlusIcon as CircleFadingPlusIcon,
  checkIcon as CheckIcon,
  arrowRightIcon as ArrowRightIcon,
  xIcon as XIcon,
} from "../../components/icons";
import "./style.css";

const SetupPage = () => {
  const [progress, setProgress] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [textAnimation, setTextAnimation] = useState<
    "fadeIn" | "fadeOut" | "visible"
  >("visible");
  const [pageAnimation, setPageAnimation] = useState<
    "fadeIn" | "fadeOut" | "visible"
  >("fadeOut");
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const navigate = useNavigate();
  const { userInfo, loading } = useUserContext();
  const { getVpnConfigUrl } = useVpnConfig(userInfo, loading);

  const getAppStoreUrl = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const language = navigator.language.toLowerCase();

    if (userAgent.includes("android") && userAgent.includes("tv")) {
      return "https://play.google.com/store/apps/details?id=com.happproxy";
    }

    if (userAgent.includes("windows")) {
      return "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe";
    }

    if (userAgent.includes("macintosh")) {
      return "https://apps.apple.com/us/app/happ-proxy-utility/id6504287215?l=ru";
    }

    if (userAgent.includes("linux")) {
      return "https://happ.su/download";
    }

    if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
      if (language.startsWith("ru")) {
        return "https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973";
      }
      return "https://apps.apple.com/us/app/happ-proxy-utility/id6504287215";
    } else {
      return "https://play.google.com/store/apps/details?id=com.happproxy&hl=ru";
    }
  };

  useEffect(() => {
    const targetProgress = progress;
    const duration = 1500;
    const startTime = Date.now();
    const startProgress = smoothProgress;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);

      const easedProgress = 1 - Math.pow(1 - progressRatio, 3);

      const currentProgress =
        startProgress + (targetProgress - startProgress) * easedProgress;
      setSmoothProgress(currentProgress);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };

    if (targetProgress !== smoothProgress) {
      requestAnimationFrame(animate);
    }
  }, [progress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageAnimation("fadeIn");
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (textAnimation === "fadeIn") {
      const timer = setTimeout(() => {
        setTextAnimation("visible");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [textAnimation]);

  useEffect(() => {
    if (pageAnimation === "fadeIn") {
      const timer = setTimeout(() => {
        setPageAnimation("visible");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pageAnimation]);

  const getSmoothProgressAngle = () => {
    return (smoothProgress / 100) * 360;
  };

  const renderConfetti = () => {
    if (!showConfetti) return null;

    return (
      <div className="SetupPage__confetti">
        {Array.from({ length: 25 }, (_, i) => (
          <div
            key={i}
            className="SetupPage__confetti-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.8}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>
    );
  };

  const startSetup = () => {
    setTextAnimation("fadeOut");
    setTimeout(() => {
      setProgress(33);
      setTextAnimation("fadeIn");
    }, 300);
  };

  const nextStep = () => {
    setTextAnimation("fadeOut");
    setTimeout(() => {
      setProgress(66);
      setTextAnimation("fadeIn");
    }, 300);
  };

  const finalStep = () => {
    setTextAnimation("fadeOut");
    setTimeout(() => {
      setProgress(100);
      setTextAnimation("fadeIn");
    }, 300);
  };

  const handleYesClick = () => {
    const configUrl = getVpnConfigUrl();
    if (configUrl) {
      window.open(configUrl, "_blank");
    } else {
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(
          "Конфигурация недоступна. Пожалуйста, купите подписку.",
        );
      }
    }
    setSubscriptionModalOpen(false);
  };

  const handleNoClick = () => {
    setSubscriptionModalOpen(false);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleCompleteSetup = () => {
    navigate("/");
  };

  const closeModalAndContinue = () => {
    closeModal();
    try {
      const appStoreUrl = getAppStoreUrl();
      window.open(appStoreUrl, "_blank");
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.BackButton) {
      const handleBackClick = () => {
        if (
          typeof window !== "undefined" &&
          window.Telegram?.WebApp?.HapticFeedback
        ) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
        }

        if (progress > 0) {
          if (progress === 100) {
            setProgress(66);
          } else if (progress === 66) {
            setProgress(33);
          } else if (progress === 33) {
            setProgress(0);
          }
        } else {
          navigate("/");
        }
      };

      if (
        typeof window !== "undefined" &&
        window.Telegram?.WebApp?.BackButton
      ) {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(handleBackClick);
      }

      return () => {
        if (
          typeof window !== "undefined" &&
          window.Telegram?.WebApp?.BackButton
        ) {
          window.Telegram.WebApp.BackButton.offClick(handleBackClick);
          window.Telegram.WebApp.BackButton.hide();
        }
      };
    }
  }, [progress, navigate]);

  const renderIcon = () => {
    if (progress === 0) {
      return <UnplugIcon width={84} height={84} className="lucide-unplug" />;
    } else if (progress === 33) {
      return (
        <CloudDownloadIcon
          width={84}
          height={84}
          className="lucide lucide-cloud-download"
          style={{ willChange: "transform" }}
        />
      );
    } else if (progress === 66) {
      return (
        <CircleFadingPlusIcon
          width={84}
          height={84}
          className="lucide lucide-circle-fading-plus"
          style={{ willChange: "transform" }}
        />
      );
    } else if (progress === 100) {
      return (
        <CheckIcon
          width={84}
          height={84}
          className="lucide lucide-check"
          style={{ willChange: "transform" }}
        />
      );
    }
  };

  const renderBottomContent = () => {
    if (progress === 0) {
      return (
        <div
          className={`flex flex-col items-center text-transition ${textAnimation}`}
        >
          <p className="text-xl">Настройка</p>
          <p className="text-default mt-2">
            Настройка VPN происходит <br />в 3 шага и занимает пару минут
          </p>
          <button
            className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 px-6 min-w-24 rounded-large [&>svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity motion-reduce:transition-none bg-primary text-primary-foreground data-[hover=true]:opacity-hover Button w-full mt-6 text-sm h-54 gap-2 Button--variant_pulsed mb-4"
            type="button"
            onClick={startSetup}
          >
            Начать настройку на этом устройстве
          </button>
          <button
            className="Button w-full text-sm text-white h-54"
            type="button"
            onClick={() =>
              window.open("https://teletype.in/@sligvpn/main", "_blank")
            }
          >
            Установить на другом устройстве
          </button>
        </div>
      );
    } else if (progress === 33) {
      return (
        <div
          className={`flex flex-col items-center text-transition ${textAnimation}`}
        >
          <p className="text-xl">Приложение</p>
          <p className="text-default mt-2">
            Установите приложение для вашего устройства <br /> и вернитесь к
            этому экрану
          </p>
          <div className="flex gap-2.5 w-full">
            <button
              className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 px-6 min-w-24 rounded-large [&>svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity motion-reduce:transition-none bg-primary text-primary-foreground data-[hover=true]:opacity-hover Button w-full mt-6 text-sm h-54 gap-2 Button--variant_pulsed"
              type="button"
              onClick={() => setModalOpen(true)}
            >
              <span>Установить</span>
              <CloudDownloadIcon
                width={32}
                height={32}
                className="lucide lucide-cloud-download-small"
                style={{ willChange: "transform" }}
              />
            </button>
            <button
              onClick={nextStep}
              className="z-0 group relative inline-flex items-center justify-between box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 px-6 min-w-24 transition-transform-colors-opacity motion-reduce:transition-none notPulse text-primary-foreground data-[hover=true]:opacity-hover Button w-full mt-6 text-sm h-54 gap-4"
              type="button"
            >
              Далее
              <ArrowRightIcon
                width={20}
                height={20}
                className="lucide lucide-arrow-right -mr-4"
              />
            </button>
          </div>
        </div>
      );
    } else if (progress === 66) {
      return (
        <div
          className={`flex flex-col items-center text-transition ${textAnimation}`}
        >
          <p className="text-xl">Подписка</p>
          <p className="text-default mt-2">
            Добавьте подписку в приложение <br /> с помощью кнопки ниже
          </p>
          <div className="flex gap-2.5 w-full">
            <button
              className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 px-6 min-w-24 rounded-large [&>svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity motion-reduce:transition-none bg-primary text-primary-foreground data-[hover=true]:opacity-hover Button w-full mt-6 text-sm h-54 gap-2 Button--variant_pulsed"
              type="button"
              onClick={() => {
                const configUrl = getVpnConfigUrl();
                if (configUrl) {
                  window.open(configUrl, "_blank");
                } else {
                  if (window.Telegram?.WebApp?.showAlert) {
                    window.Telegram.WebApp.showAlert(
                      "Конфигурация недоступна. Пожалуйста, купите подписку.",
                    );
                  }
                }
              }}
            >
              Добавить
              <CircleFadingPlusIcon
                width={20}
                height={20}
                className="lucide lucide-circle-fading-plus"
              />
            </button>
            <button
              className="z-0 group relative inline-flex items-center justify-between box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 px-6 min-w-24 transition-transform-colors-opacity motion-reduce:transition-none notPulse text-primary-foreground data-[hover=true]:opacity-hover Button w-full mt-6 text-sm h-54 gap-4"
              type="button"
              onClick={finalStep}
            >
              Далее
              <ArrowRightIcon
                width={20}
                height={20}
                className="lucide lucide-arrow-right -mr-4"
              />
            </button>
          </div>
        </div>
      );
    } else if (progress === 100) {
      return (
        <div
          className={`flex flex-col items-center text-transition ${textAnimation}`}
        >
          <p className="text-xl">Готово!</p>
          <p className="text-default text-balance mt-2">
            Нажмите на круглую кнопку включения VPN в приложении Happ
          </p>
          <div className="flex gap-2.5 w-full">
            <button
              className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 px-6 min-w-24 transition-transform-colors-opacity motion-reduce:transition-none notPulse text-primary-foreground data-[hover=true]:opacity-hover Button w-full mt-6 text-sm h-54 gap-4"
              type="button"
              onClick={handleCompleteSetup}
            >
              Завершить настройку
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="App">
      <div className={`SetupPage text-transition ${pageAnimation}`}>
        <div className="SetupPage__top">
          <div className="flex items-center justify-center" id="top-content">
            <div className="SetupPage__topRings">
              <div id="ring-1"></div>
              <div id="ring-2" className={progress >= 33 ? "active" : ""}></div>
              <div id="ring-3"></div>
              <div id="ring-4"></div>
              <div id="ring-5"></div>
              <div id="ring-6"></div>
              <div id="ring-7"></div>
              <div id="ring-8"></div>
            </div>
            <div
              className="SetupPage__progress"
              id="progress-bar"
              role="progressbar"
            >
              <div
                className={`SetupPage__progressCircle ${progress === 100 ? "completed" : ""}`}
                style={
                  {
                    "--progress-angle": `${getSmoothProgressAngle()}deg`,
                  } as React.CSSProperties
                }
              >
                {renderIcon()}
              </div>
              {renderConfetti()}
            </div>
          </div>
        </div>
        <div className="SetupPage__bottom" id="bottom-content">
          {renderBottomContent()}
        </div>
      </div>

      <div
        className={`modal-overlay ${modalOpen ? "modal-overlay--open" : ""}`}
        id="modal-overlay"
      ></div>
      <section
        className={`modal bg-dark ${modalOpen ? "modal--open" : ""}`}
        id="modal"
      >
        <div>
          <button
            id="react-aria6219639144-:r1o:"
            aria-label="Пропустить"
          ></button>
        </div>
        <header className="modal-header">
          <span className="modal-header-text">Важная информация</span>
          <button
            className="modal-close-button"
            type="button"
            onClick={closeModal}
          >
            <XIcon width={24} height={24} className="modal-close" />
          </button>
        </header>
        <div style={{ padding: "0 20px 20px 20px" }}>
          <p>
            После установки приложения, обязательно вернитесь на этот экран и
            нажмите «Далее», чтобы добавить конфигурацию в приложение, без этого
            VPN работать не будет
          </p>
          <p style={{ marginTop: "8px", fontSize: "13px", opacity: 0.8 }}>
            Для Android TV: tv.happ.su или happ.su/download
          </p>
          <button
            className="Button bg-primary text-white h-54 mt-2"
            type="button"
            onClick={closeModalAndContinue}
          >
            Хорошо, перейти к установке
          </button>
        </div>
        <div>
          <button
            id="react-aria6219639144-:r1p:"
            aria-label="Пропустить"
          ></button>
        </div>
      </section>

      <div
        className={`subscription-modal-overlay ${subscriptionModalOpen ? "subscription-modal-overlay--open" : ""}`}
        id="subscription-modal-overlay"
        onClick={handleNoClick}
      ></div>
      <section
        className={`subscription-modal ${subscriptionModalOpen ? "subscription-modal--open" : ""}`}
        id="subscription-modal"
      >
        <div className="subscription-modal-content">
          {getVpnConfigUrl() ? (
            <>
              <h3 className="subscription-modal-title">VPN Приложение</h3>
              <p className="subscription-modal-text">
                Перейти в приложение для добавления подписки?
              </p>

              <div className="subscription-link-container">
                <p className="subscription-link-label">Скопируйте ссылку:</p>
                <div className="subscription-link-box">
                  <code className="subscription-link-text">
                    {getVpnConfigUrl()}
                  </code>
                  <button
                    className="subscription-copy-button"
                    type="button"
                    onClick={() => {
                      const configUrl = getVpnConfigUrl();
                      if (configUrl) {
                        navigator.clipboard.writeText(configUrl);
                      }
                    }}
                    title="Скопировать ссылку"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="subscription-modal-buttons">
                <button
                  className="Button subscription-button subscription-button--no"
                  type="button"
                  onClick={handleNoClick}
                >
                  Отмена
                </button>
                <button
                  className="Button subscription-button subscription-button--yes"
                  type="button"
                  onClick={handleYesClick}
                >
                  Добавить
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="subscription-modal-title">
                Конфигурация недоступна
              </h3>
              <p className="subscription-modal-text">
                У вас отсутствуют конфигурации, сначала купите подписку.
              </p>

              <div className="subscription-modal-buttons">
                <button
                  className="Button subscription-button subscription-button--no"
                  type="button"
                  onClick={handleNoClick}
                >
                  Понятно
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default SetupPage;

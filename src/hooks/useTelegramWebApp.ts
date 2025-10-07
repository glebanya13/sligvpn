import { useCallback, useEffect } from "react";

export const useTelegramWebApp = () => {
  const isAvailable = !!window.Telegram?.WebApp;

  const initialize = useCallback(() => {
    if (isAvailable && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, [isAvailable]);

  const handleBackButton = useCallback((callback?: () => void) => {
    if (window.Telegram?.WebApp?.BackButton) {
      const backButton = window.Telegram.WebApp.BackButton;

      if (callback) {
        backButton.show();
        backButton.onClick(callback);
      } else {
        backButton.hide();
        backButton.onClick(null);
      }
    }
  }, []);

  const handleMainButton = useCallback((text: string, callback: () => void) => {
    if (window.Telegram?.WebApp?.MainButton) {
      const mainButton = window.Telegram.WebApp.MainButton;
      mainButton.setText(text);
      mainButton.onClick(callback);
      mainButton.show();
    }
  }, []);

  const handleHapticFeedback = useCallback(
    (style: "light" | "medium" | "heavy" | "rigid" | "soft" = "light") => {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      }
    },
    []
  );

  useEffect(() => {
    if (isAvailable) {
      initialize();
    }
  }, [isAvailable, initialize]);

  return {
    isAvailable,
    initialize,
    handleBackButton,
    handleMainButton,
    handleHapticFeedback,
  };
};

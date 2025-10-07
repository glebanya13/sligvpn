import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTelegramWebApp } from "./useTelegramWebApp";

export const useTelegramPage = () => {
  const navigate = useNavigate();
  const { handleBackButton, handleHapticFeedback } = useTelegramWebApp();

  const handleBackClick = useCallback(() => {
    handleHapticFeedback("light");
    navigate(-1);
  }, [handleHapticFeedback, navigate]);

  const setupBackButton = useCallback(() => {
    handleBackButton(handleBackClick);
  }, [handleBackButton, handleBackClick]);

  const cleanupBackButton = useCallback(() => {
    handleBackButton();
  }, [handleBackButton]);

  useEffect(() => {
    setupBackButton();

    return () => {
      cleanupBackButton();
    };
  }, [setupBackButton, cleanupBackButton]);

  return {
    handleBackClick,
    handleHapticFeedback,
  };
};

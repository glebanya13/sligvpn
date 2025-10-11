import { useCallback } from "react";
import { useLoading } from "../contexts/loading.context";

/**
 * Хук для удобного управления состоянием загрузки
 * Предоставляет методы для показа/скрытия загрузки с автоматическим управлением
 */
export const useLoadingState = () => {
  const { showLoading, hideLoading, setLoadingText } = useLoading();

  /**
   * Показывает загрузку с автоматическим скрытием через указанное время
   * @param text - текст загрузки
   * @param duration - длительность показа в мс (по умолчанию 2000мс)
   */
  const showLoadingWithTimeout = useCallback(
    (text: string = "Загрузка...", duration: number = 2000) => {
      showLoading(text);
      setTimeout(() => {
        hideLoading();
      }, duration);
    },
    [showLoading, hideLoading],
  );

  /**
   * Показывает загрузку для асинхронной операции
   * @param asyncFn - асинхронная функция
   * @param loadingText - текст загрузки
   */
  const withLoading = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      loadingText: string = "Загрузка...",
    ): Promise<T> => {
      try {
        showLoading(loadingText);
        const result = await asyncFn();
        return result;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading],
  );

  return {
    showLoading,
    hideLoading,
    setLoadingText,
    showLoadingWithTimeout,
    withLoading,
  };
};

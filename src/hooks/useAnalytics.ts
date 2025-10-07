import { useCallback } from "react";
import { AnalyticsCategory, AnalyticsAction } from "../helpers/enum";

declare global {
  interface Window {
    ym: (id: string, method: string, target?: string, params?: any) => void;
  }
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customData?: Record<string, any>;
}

export interface ErrorEvent {
  error: string;
  stack?: string;
  component?: string;
  action?: string;
  userId?: number;
  customData?: Record<string, any>;
}

export interface PerformanceEvent {
  metric: string;
  value: number;
  unit: string;
  customData?: Record<string, any>;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private errors: ErrorEvent[] = [];
  private performance: PerformanceEvent[] = [];
  private userId: number | null = null;

  setUserId(userId: number) {
    this.userId = userId;
  }

  trackEvent(event: AnalyticsEvent) {
    const enrichedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.events.push(enrichedEvent);

    if (process.env.NODE_ENV === "development") {
    }

    this.sendToExternalService("event", enrichedEvent);
  }

  trackError(error: ErrorEvent) {
    const enrichedError = {
      ...error,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.errors.push(enrichedError);

    if (process.env.NODE_ENV === "development") {
    }

    this.sendToExternalService("error", enrichedError);
  }

  trackPerformance(metric: PerformanceEvent) {
    const enrichedMetric = {
      ...metric,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.getSessionId(),
    };

    this.performance.push(enrichedMetric);

    if (process.env.NODE_ENV === "development") {
    }

    this.sendToExternalService("performance", enrichedMetric);
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("analytics_session_id", sessionId);
    }
    return sessionId;
  }

  private sendToExternalService(type: string, data: any) {
    if (typeof window !== "undefined" && window.ym) {
      try {
        if (type === "event") {
          window.ym(
            process.env.REACT_APP_YANDEX_METRIKA_ID || "104273447",
            "reachGoal",
            data.action,
            {
              category: data.category,
              label: data.label,
              value: data.value,
              ...data.customData,
            },
          );
        } else if (type === "error") {
          window.ym(
            process.env.REACT_APP_YANDEX_METRIKA_ID || "104273447",
            "reachGoal",
            "error",
            {
              error: data.error,
              component: data.component,
              action: data.action,
              ...data.customData,
            },
          );
        }
      } catch (err) {}
    }

    if (process.env.NODE_ENV === "production") {
      fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, data }),
      }).catch((err) => {});
    }
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getErrors(): ErrorEvent[] {
    return [...this.errors];
  }

  getPerformance(): PerformanceEvent[] {
    return [...this.performance];
  }

  clearData() {
    this.events = [];
    this.errors = [];
    this.performance = [];
  }
}

const analyticsService = new AnalyticsService();

export const useAnalytics = () => {
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    analyticsService.trackEvent(event);
  }, []);

  const trackError = useCallback((error: ErrorEvent) => {
    analyticsService.trackError(error);
  }, []);

  const trackPerformance = useCallback((metric: PerformanceEvent) => {
    analyticsService.trackPerformance(metric);
  }, []);

  const setUserId = useCallback((userId: number) => {
    analyticsService.setUserId(userId);
  }, []);

  const getEvents = useCallback(() => {
    return analyticsService.getEvents();
  }, []);

  const getErrors = useCallback(() => {
    return analyticsService.getErrors();
  }, []);

  const getPerformance = useCallback(() => {
    return analyticsService.getPerformance();
  }, []);

  const clearData = useCallback(() => {
    analyticsService.clearData();
  }, []);

  return {
    trackEvent,
    trackError,
    trackPerformance,
    setUserId,
    getEvents,
    getErrors,
    getPerformance,
    clearData,
  };
};

export const AnalyticsEvents = {
  PAGE_VIEW: (page: string) => ({
    action: "page_view",
    category: "navigation",
    label: page,
  }),

  BUTTON_CLICK: (buttonName: string, page: string) => ({
    action: "button_click",
    category: "interaction",
    label: buttonName,
    customData: { page },
  }),

  PAYMENT_STARTED: (
    provider: string,
    amount: number,
    months: number,
    isFirstPurchase?: boolean,
  ) => ({
    action: AnalyticsAction.PAYMENT_STARTED,
    category: AnalyticsCategory.PAYMENT,
    label: provider,
    value: amount,
    customData: {
      months,
      isFirstPurchase,
      purchaseType: isFirstPurchase ? "first_purchase" : "renewal",
    },
  }),

  PAYMENT_SUCCESS: (
    provider: string,
    amount: number,
    months: number,
    isFirstPurchase?: boolean,
  ) => ({
    action: AnalyticsAction.PAYMENT_SUCCESS,
    category: AnalyticsCategory.PAYMENT,
    label: provider,
    value: amount,
    customData: {
      months,
      isFirstPurchase,
      purchaseType: isFirstPurchase ? "first_purchase" : "renewal",
    },
  }),

  PAYMENT_FAILED: (provider: string, error: string) => ({
    action: AnalyticsAction.PAYMENT_FAILED,
    category: AnalyticsCategory.PAYMENT,
    label: provider,
    customData: { error },
  }),

  // Модальные окна
  MODAL_OPENED: (modalName: string) => ({
    action: "modal_opened",
    category: "ui",
    label: modalName,
  }),

  MODAL_CLOSED: (modalName: string) => ({
    action: "modal_closed",
    category: "ui",
    label: modalName,
  }),

  // Ошибки
  API_ERROR: (endpoint: string, error: string) => ({
    action: "api_error",
    category: "error",
    label: endpoint,
    customData: { error },
  }),

  // Производительность
  PAGE_LOAD_TIME: (page: string, loadTime: number) => ({
    action: "page_load_time",
    category: "performance",
    label: page,
    value: loadTime,
    customData: { unit: "ms" },
  }),
};

export default analyticsService;

export enum AnalyticsCategory {
  PAYMENT = "payment",
  USER = "user",
  NAVIGATION = "navigation",
  ERROR = "error",
}

export enum AnalyticsAction {
  PAYMENT_STARTED = "payment_started",
  PAYMENT_SUCCESS = "payment_success",
  PAYMENT_FAILED = "payment_failed",
  PAYMENT_COMPLETED = "payment_completed",
  USER_LOGIN = "user_login",
  USER_LOGOUT = "user_logout",
  PAGE_VIEW = "page_view",
  BUTTON_CLICK = "button_click",
}

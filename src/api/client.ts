import {
  PaymentProvider,
  Currency,
  BalanceType,
  TransactionType,
  PaymentStatus,
} from "../helpers/enum";

const API_BASE_URL = "https://receiver.sligvpn.ru";

export interface ApiResponse<T = any> {
  ok?: boolean;
  data?: T;
  detail?: string;
}

export interface UserInfo {
  user_id: number;
  balance: number;
  bonus_balance: number;
  trial_used: boolean;
  subscription_until: string | null;
  referral_code: string;
  referred_by: number | null;
  referral_balance: number;
  webapp_preview_opened: boolean;
  configs: Array<{
    id: number;
    config_link: string;
    tariff_type: string;
    expiry_date: string;
    is_active: boolean;
  }>;
}

export interface Tariff {
  id: number;
  months: number;
  price: number;
  title: string;
  description: string;
}

export interface PurchaseRequest {
  provider: PaymentProvider;
  months: number;
  currency?: string;
  balance_type?: BalanceType;
}

export interface PurchaseResponse {
  provider: string;
  amount: number;
  currency: string;
  payment_url?: string;
  external_id: string;
  invoice?: {
    title: string;
    description: string;
    payload: string;
    provider_token: string;
    currency: string;
    prices: Array<{
      label: string;
      amount: number;
    }>;
    invoice_url?: string;
    payment_id?: string;
    amount?: string;
  };
  success?: boolean;
  payment_id?: string;
  amount_paid?: number;
  remaining_balance?: number;
  subscription_months?: number;
  config_id?: number;
  expiry_date?: string;
  message?: string;
}

export interface SubscriptionConfig {
  id: number;
  config_link: string;
  tariff_type: string;
  expiry_date: string;
}

export interface Transaction {
  external_id: string;
  amount: number;
  currency: string;
  provider: string;
  status: PaymentStatus;
  created_at: string;
}

export interface ReferralInfo {
  referral_code: string;
  referral_balance: number;
  invited: number;
  referral_link: string;
}

export interface WithdrawRequest {
  amount: number;
  destination: string;
}

export interface InstallGuide {
  format: string;
  content: string;
}

export interface BalanceCheckResponse {
  real_balance: number;
  bonus_balance: number;
  price: number;
  can_pay_real: boolean;
  can_pay_bonus: boolean;
  has_discount: boolean;
  discount_percent: number;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const initData = window.Telegram?.WebApp?.initData;

    return {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json();
  }

  async ping(): Promise<{ ok: boolean; ts: number }> {
    return this.request("/api/ping");
  }

  async getUserInfo(): Promise<UserInfo> {
    if (!window.Telegram?.WebApp?.initData) {
      throw new Error(
        "Не удалось получить данные Telegram. Откройте приложение через Telegram. Если проблема сохраняется — обратитесь в поддержку: https://t.me/SligVPNHelp",
      );
    }

    return this.request("/api/me");
  }

  async getTariffs(): Promise<Tariff[]> {
    return this.request("/api/tariffs");
  }

  async createPurchase(data: PurchaseRequest): Promise<PurchaseResponse> {
    const response = await this.request<PurchaseResponse>("/api/purchase", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  }

  async purchaseWithBalance(data: {
    months: number;
    balance_type: BalanceType;
  }): Promise<PurchaseResponse> {
    return this.request("/api/purchase/balance", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getSubscriptionConfigs(): Promise<SubscriptionConfig[]> {
    return this.request("/api/subscription/configs");
  }

  async checkPaymentStatus(paymentId: string): Promise<{
    success: boolean;
    payment_id: string;
    subscription_created?: boolean;
    expiry_date?: string;
    config_link?: string;
    status?: string;
  }> {
    return this.request(`/api/purchase/status/${paymentId}`);
  }

  async getTransactions(): Promise<Transaction[]> {
    if (
      process.env.NODE_ENV === "development" &&
      !window.Telegram?.WebApp?.initData
    ) {
      const mockTransactions: Transaction[] = [
        {
          external_id: "tx_001",
          amount: 299,
          currency: Currency.RUB,
          provider: PaymentProvider.YOOKASSA,
          status: PaymentStatus.COMPLETED,
          created_at: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          external_id: "tx_002",
          amount: 50,
          currency: Currency.STARS,
          provider: PaymentProvider.STARS,
          status: PaymentStatus.COMPLETED,
          created_at: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          external_id: "tx_003",
          amount: 0.001,
          currency: Currency.BTC,
          provider: PaymentProvider.STARS,
          status: PaymentStatus.PENDING,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          external_id: "tx_004",
          amount: 199,
          currency: Currency.RUB,
          provider: PaymentProvider.BALANCE,
          status: PaymentStatus.COMPLETED,
          created_at: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      ];
      return Promise.resolve(mockTransactions);
    }

    return this.request("/api/transactions");
  }

  async getReferralInfo(): Promise<ReferralInfo> {
    return this.request("/api/referral");
  }

  async withdrawReferralBalance(
    data: WithdrawRequest,
  ): Promise<{ ok: boolean; message: string }> {
    return this.request("/api/referral/withdraw", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getInstallGuide(): Promise<InstallGuide> {
    return this.request("/api/install");
  }

  async markPreviewOpened(
    opened: boolean,
  ): Promise<{ success: boolean; user_id: number; preview_opened: boolean }> {
    return this.request("/api/webapp/preview/opened", {
      method: "POST",
      body: JSON.stringify({ opened }),
    });
  }

  async checkBalance(months: number): Promise<BalanceCheckResponse> {
    return this.request(`/api/balance/check/${months}`);
  }

  async getBalanceHistory(
    params: BalanceHistoryParams = {},
  ): Promise<BalanceHistoryResponse> {
    const searchParams = new URLSearchParams();

    if (params.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }
    if (params.offset !== undefined) {
      searchParams.append("offset", params.offset.toString());
    }
    if (params.type) {
      searchParams.append("filter_type", params.type);
    }

    const queryString = searchParams.toString();
    const url = queryString
      ? `/api/balance/history?${queryString}`
      : "/api/balance/history";

    return this.request(url);
  }
}

export interface BalanceHistoryItem {
  id: string;
  amount: number;
  type: TransactionType;
  currency: Currency;
  description: string;
  created_at: string;
  is_positive: boolean;
}

export interface BalanceHistoryPagination {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface BalanceHistoryResponse {
  history: BalanceHistoryItem[];
  pagination: BalanceHistoryPagination;
}

export interface BalanceHistoryParams {
  limit?: number;
  offset?: number;
  type?: TransactionType;
}

export const apiClient = new ApiClient();

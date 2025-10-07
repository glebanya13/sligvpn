import { useCallback, useState } from "react";
import {
  apiClient,
  BalanceCheckResponse,
  InstallGuide,
  PurchaseRequest,
  PurchaseResponse,
  ReferralInfo,
  SubscriptionConfig,
  Tariff,
  Transaction,
  UserInfo,
  WithdrawRequest,
} from "../api/client";
import { BalanceType } from "../helpers/enum";

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Произошла ошибка";
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
};

export const useUserInfo = () => {
  const { data, loading, error, execute, reset } = useApi<UserInfo>();

  const fetchUserInfo = useCallback(() => {
    return execute(() => apiClient.getUserInfo());
  }, [execute]);

  return { userInfo: data, loading, error, fetchUserInfo, reset };
};

export const useTariffs = () => {
  const { data, loading, error, execute, reset } = useApi<Tariff[]>();

  const fetchTariffs = useCallback(() => {
    return execute(() => apiClient.getTariffs());
  }, [execute]);

  return { tariffs: data, loading, error, fetchTariffs, reset };
};

export const usePurchase = () => {
  const { data, loading, error, execute, reset } = useApi<PurchaseResponse>();

  const createPurchase = useCallback(
    (purchaseData: PurchaseRequest) => {
      return execute(() => apiClient.createPurchase(purchaseData));
    },
    [execute]
  );

  return { purchaseResponse: data, loading, error, createPurchase, reset };
};

export const useBalancePurchase = () => {
  const { data, loading, error, execute, reset } = useApi<PurchaseResponse>();

  const purchaseWithBalance = useCallback(
    (months: number, balanceType: BalanceType = BalanceType.REAL) => {
      return execute(() =>
        apiClient.purchaseWithBalance({ months, balance_type: balanceType })
      );
    },
    [execute]
  );

  return {
    balancePurchaseResponse: data,
    loading,
    error,
    purchaseWithBalance,
    reset,
  };
};

export const useSubscriptionConfigs = () => {
  const { data, loading, error, execute, reset } =
    useApi<SubscriptionConfig[]>();

  const fetchConfigs = useCallback(() => {
    return execute(() => apiClient.getSubscriptionConfigs());
  }, [execute]);

  return { configs: data, loading, error, fetchConfigs, reset };
};

export const useTransactions = () => {
  const { data, loading, error, execute, reset } = useApi<Transaction[]>();

  const fetchTransactions = useCallback(() => {
    return execute(() => apiClient.getTransactions());
  }, [execute]);

  return { transactions: data, loading, error, fetchTransactions, reset };
};

export const useReferralInfo = () => {
  const { data, loading, error, execute, reset } = useApi<ReferralInfo>();

  const fetchReferralInfo = useCallback(() => {
    return execute(() => apiClient.getReferralInfo());
  }, [execute]);

  return { referralInfo: data, loading, error, fetchReferralInfo, reset };
};

export const useWithdrawReferral = () => {
  const { data, loading, error, execute, reset } = useApi<{
    ok: boolean;
    message: string;
  }>();

  const withdrawReferral = useCallback(
    (withdrawData: WithdrawRequest) => {
      return execute(() => apiClient.withdrawReferralBalance(withdrawData));
    },
    [execute]
  );

  return { withdrawResponse: data, loading, error, withdrawReferral, reset };
};

export const useInstallGuide = () => {
  const { data, loading, error, execute, reset } = useApi<InstallGuide>();

  const fetchInstallGuide = useCallback(() => {
    return execute(() => apiClient.getInstallGuide());
  }, [execute]);

  return { installGuide: data, loading, error, fetchInstallGuide, reset };
};

export const useMarkPreviewOpened = () => {
  const { data, loading, error, execute, reset } = useApi<{
    success: boolean;
    user_id: number;
    preview_opened: boolean;
  }>();

  const markPreviewOpened = useCallback(
    (opened: boolean) => {
      return execute(() => apiClient.markPreviewOpened(opened));
    },
    [execute]
  );

  return { result: data, loading, error, markPreviewOpened, reset };
};

export const useBalanceCheck = () => {
  const { data, loading, error, execute, reset } =
    useApi<BalanceCheckResponse>();

  const checkBalance = useCallback(
    (months: number) => {
      return execute(() => apiClient.checkBalance(months));
    },
    [execute]
  );

  return { result: data, loading, error, checkBalance, reset };
};

import { useState, useCallback, useEffect } from "react";
import {
  apiClient,
  BalanceHistoryItem,
  BalanceHistoryResponse,
  BalanceHistoryParams,
} from "../api/client";
import { TransactionType } from "../helpers/enum";

export const useBalanceHistory = () => {
  const [history, setHistory] = useState<BalanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<
    BalanceHistoryResponse["pagination"] | null
  >(null);

  const fetchBalanceHistory = useCallback(
    async (params: BalanceHistoryParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.getBalanceHistory({
          ...params,
          type: TransactionType.REFERRAL,
        });
        setHistory(response.history);
        setPagination(response.pagination);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ошибка загрузки истории начислений",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadMore = useCallback(async () => {
    if (!pagination?.has_more || loading) return;

    setLoading(true);
    try {
      const response = await apiClient.getBalanceHistory({
        type: TransactionType.REFERRAL,
        limit: pagination.limit,
        offset: pagination.offset + pagination.limit,
      });
      setHistory((prev) => [...prev, ...response.history]);
      setPagination(response.pagination);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ошибка загрузки дополнительных записей",
      );
    } finally {
      setLoading(false);
    }
  }, [pagination, loading]);

  useEffect(() => {
    fetchBalanceHistory();
  }, [fetchBalanceHistory]);

  return {
    history,
    loading,
    error,
    pagination,
    fetchBalanceHistory,
    loadMore,
  };
};

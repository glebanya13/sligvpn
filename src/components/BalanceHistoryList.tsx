import React from "react";
import { BalanceHistoryItem } from "../api/client";
import { Currency } from "../helpers/enum";

interface BalanceHistoryListProps {
  history: BalanceHistoryItem[];
  loading: boolean;
  error: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const BalanceHistoryList: React.FC<BalanceHistoryListProps> = ({
  history,
  loading,
  error,
  onLoadMore,
  hasMore = false,
}) => {
  const formatAmount = (
    amount: number,
    currency: string,
    isPositive: boolean,
  ) => {
    const sign = isPositive ? "+" : "-";
    const currencySymbol = currency === Currency.RUB ? "₽" : currency;
    return `${sign}${Math.abs(amount)} ${currencySymbol}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      payment: "Платеж",
      referral: "Реферальная программа",
      bonus: "Бонус",
      withdrawal: "Списание",
    };

    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      payment: "💳",
      referral: "👥",
      bonus: "🎁",
      withdrawal: "💸",
    };
    return icons[type as keyof typeof icons] || "💳";
  };

  if (loading && history.length === 0) {
    return (
      <div className="balance-history-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка истории начислений...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="balance-history-error">
        <p>❌ {error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="balance-history-empty">
        <p>История начислений пуста</p>
      </div>
    );
  }

  return (
    <div className="balance-history-list">
      {history.map((item) => (
        <div
          key={item.id}
          className={`balance-history-item ${item.is_positive ? "positive" : "negative"}`}
        >
          <div className="balance-history-item-header">
            <div className="balance-history-item-icon">
              {getTypeIcon(item.type)}
            </div>
            <div className="balance-history-item-info">
              <div className="balance-history-item-type">
                {getTypeLabel(item.type)}
              </div>
              <div className="balance-history-item-date">
                {formatDate(item.created_at)}
              </div>
            </div>
            <div className="balance-history-item-amount">
              {formatAmount(item.amount, item.currency, item.is_positive)}
            </div>
          </div>
          {item.description && (
            <div className="balance-history-item-description">
              {item.description}
            </div>
          )}
        </div>
      ))}

      {hasMore && (
        <button
          className="balance-history-load-more"
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? "Загрузка..." : "Загрузить еще"}
        </button>
      )}
    </div>
  );
};

export default BalanceHistoryList;

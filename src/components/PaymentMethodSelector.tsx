import { memo } from "react";
import "./PaymentMethodSelector.css";
import { PaymentProvider } from "../helpers/enum";
import { checkCircleIcon as CheckCircleIcon } from "./icons";

interface PaymentMethodSelectorProps {
  selectedProvider: PaymentProvider;
  onProviderChange: (provider: PaymentProvider) => void;
}

const PaymentMethodSelector = memo(
  ({ selectedProvider, onProviderChange }: PaymentMethodSelectorProps) => {
    const paymentMethods = [
      {
        id: PaymentProvider.BALANCE,
        name: "С баланса",
        description: "Оплата с текущего баланса",
        icon: "💰",
        color: "bg-purple-500/20",
        selectedColor: "bg-purple-500/30",
      },
      {
        id: PaymentProvider.STARS,
        name: "Telegram Stars",
        description: "Оплата через Telegram Stars",
        icon: "⭐",
        color: "bg-yellow-500/20",
        selectedColor: "bg-yellow-500/30",
      },
      {
        id: PaymentProvider.YOOKASSA,
        name: "YooKassa",
        description: "Банковские карты, СБП",
        icon: "💳",
        color: "bg-blue-500/20",
        selectedColor: "bg-blue-500/30",
      },
      {
        id: PaymentProvider.CRYPTO,
        name: "Криптовалюта",
        description: "USDT, Bitcoin, Ethereum",
        icon: "₿",
        color: "bg-green-500/20",
        selectedColor: "bg-green-500/30",
      },
    ];

    return (
      <div className="payment-method-selector">
        <h3 className="text-lg font-semibold text-white mb-4">Способ оплаты</h3>
        <div className="grid gap-3">
          {paymentMethods.map(method => (
            <div
              key={method.id}
              className={`payment-method-item p-4 rounded-xl ${
                selectedProvider === method.id
                  ? method.selectedColor
                  : method.color
              } border border-transparent`}
              onClick={() => {
                onProviderChange(method.id);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl w-8 h-8 flex items-center justify-center">
                  {method.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{method.name}</div>
                  <div className="text-sm text-gray-300">
                    {method.description}
                  </div>
                </div>
                {selectedProvider === method.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircleIcon
                      width={12}
                      height={12}
                      className="w-3 h-3 text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

PaymentMethodSelector.displayName = "PaymentMethodSelector";

export default PaymentMethodSelector;

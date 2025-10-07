import { useTelegramPage } from "../../hooks/useTelegramPage";
import { walletCardsIcon as WalletCardsIcon } from "../../components/icons";
import "./style.css";

const PaymentPage = () => {
  useTelegramPage();

  return (
    <div className="App App--scheme_ultima">
      <div className="PaymentPage flex flex-col w-full text-white">
        <div className="py-2 mt-2 flex items-center justify-between">
          <h1 className="text-2xl">Оплата</h1>
        </div>
        <div className="flex flex-col gap-1 mt-4">
          <div className="w-full bg-black/30 px-4 py-3 rounded-xl">
            <div className="flex flex-col items-center justify-center text-center text-balance LUNATIC py-2 text-white/90">
              <WalletCardsIcon
                width={24}
                height={24}
                className="lucide lucide-wallet-cards"
              />
              <p className="text-sm pt-2">
                У вас еще нет добавленных способов оплаты
              </p>
            </div>
          </div>
          <button
            className="Button border-0 w-full h-54 bg-primary-dark-500 text-white mt-2"
            type="button"
          >
            Включить автопродление
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

import { memo } from "react";
import { Tariff } from "../api/client";

interface TariffCardProps {
  tariff: Tariff;
  isSelected?: boolean;
  onSelect?: (tariff: Tariff) => void;
}

const TariffCard = memo(
  ({ tariff, isSelected = false, onSelect }: TariffCardProps) => {
    const handleClick = () => {
      if (onSelect) {
        onSelect(tariff);
      }
    };

    return (
      <div
        className={`z-0 group relative items-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 min-w-20 text-small rounded-medium [&>svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity motion-reduce:transition-none text-foreground Button OrderPage__button flex flex-col justify-start gap-0 h-auto w-auto px-5 py-5 color-white border-2 bg-primary-dark-900 cursor-pointer ${
          isSelected
            ? "OrderPage__button--selected border-primary-70"
            : "border-primary-20"
        }`}
        onClick={handleClick}
      >
        <p className="text-sm">{tariff.title}</p>
        {tariff.months === 6 && (
          <div className="OrderPage__buttonChip">Популярный</div>
        )}
        <p className="font-medium text-2xl mt-8">{tariff.price} ₽</p>
        {tariff.months !== 1 && (
          <p className="transition duration-300 text-default">
            {Math.round(tariff.price / tariff.months)} ₽ в месяц
          </p>
        )}
      </div>
    );
  },
);

TariffCard.displayName = "TariffCard";

export default TariffCard;

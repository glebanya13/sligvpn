import React from "react";

interface CreditCardIconProps {
  width?: number;
  height?: number;
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

const creditCardIcon: React.FC<CreditCardIconProps> = ({
  width = 24,
  height = 24,
  className = "",
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 28"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="5" rx="2"></rect>
      <line x1="2" y1="10" x2="22" y2="10"></line>
    </svg>
  );
};

export default creditCardIcon;

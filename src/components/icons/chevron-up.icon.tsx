import React from "react";

interface ChevronUpIconProps {
  width?: number;
  height?: number;
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

const chevronUpIcon: React.FC<ChevronUpIconProps> = ({
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
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m18 15-6-6-6 6"></path>
    </svg>
  );
};

export default chevronUpIcon;

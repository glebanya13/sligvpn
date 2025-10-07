import React from "react";

interface ListIconProps {
  width?: number;
  height?: number;
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

const listIcon: React.FC<ListIconProps> = ({
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
      <path d="M3 12h.01"></path>
      <path d="M3 18h.01"></path>
      <path d="M3 6h.01"></path>
      <path d="M8 12h13"></path>
      <path d="M8 18h13"></path>
      <path d="M8 6h13"></path>
    </svg>
  );
};

export default listIcon;

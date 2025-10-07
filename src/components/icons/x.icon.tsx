import React from "react";

interface XIconProps {
  width?: number;
  height?: number;
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

const xIcon: React.FC<XIconProps> = ({
  width = 24,
  height = 24,
  className = "",
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2,
}) => {
  return (
    <svg
      aria-hidden="true"
      fill={fill}
      focusable="false"
      height={height}
      role="presentation"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={width}
      className={className}
    >
      <path d="M18 6L6 18M6 6l12 12"></path>
    </svg>
  );
};

export default xIcon;

import React from "react";

interface CircleFadingPlusIconProps {
  width?: number;
  height?: number;
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

const circleFadingPlusIcon: React.FC<CircleFadingPlusIconProps> = ({
  width = 24,
  height = 24,
  className = "",
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 1.25,
  style,
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
      style={style}
    >
      <path d="M12 2a10 10 0 0 1 7.38 16.75"></path>
      <path d="M12 8v8"></path>
      <path d="M16 12H8"></path>
      <path d="M2.5 8.875a10 10 0 0 0-.5 3"></path>
      <path d="M2.83 16a10 10 0 0 0 2.43 3.4"></path>
      <path d="M4.636 5.235a10 10 0 0 1 .891-.857"></path>
      <path d="M8.644 21.42a10 10 0 0 0 7.631-.38"></path>
    </svg>
  );
};

export default circleFadingPlusIcon;

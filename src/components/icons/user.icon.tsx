import React from "react";

interface UserIconProps {
  width?: number;
  height?: number;
  className?: string;
  fill?: string;
  stroke?: string;
}

const userIcon: React.FC<UserIconProps> = ({
  width = 24,
  height = 24,
  className = "",
  fill = "none",
  stroke = "#FFFFFF",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
};

export default userIcon;

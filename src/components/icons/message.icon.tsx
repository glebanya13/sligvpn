import React from "react";

interface MessageIconProps {
  width?: number;
  height?: number;
  className?: string;
  fill?: string;
  stroke?: string;
}

const messageIcon: React.FC<MessageIconProps> = ({
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
};

export default messageIcon;

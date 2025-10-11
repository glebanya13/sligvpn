import React from "react";
import "./Loading.css";

interface LoadingProps {
  visible?: boolean;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  visible = true,
  text = "Загрузка...",
}) => {
  if (!visible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-arc">
            <div className="spinner-dots"></div>
            <div className="spinner-line"></div>
          </div>
        </div>
        {text && <div className="loading-text">{text}</div>}
      </div>
    </div>
  );
};

export default Loading;

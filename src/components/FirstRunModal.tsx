import { useEffect, useState } from "react";
import "./FirstRunModal.css";

interface FirstRunModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ButtonPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const FirstRunModal = ({ isOpen, onClose }: FirstRunModalProps) => {
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition | null>(
    null,
  );

  useEffect(() => {
    if (isOpen) {
      const calculatePosition = () => {
        const button = document.getElementById("setup-button");
        if (button) {
          const rect = button.getBoundingClientRect();
          setButtonPosition({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
        }
      };

      calculatePosition();

      const interval = setInterval(calculatePosition, 16);

      const handleResize = () => {
        calculatePosition();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        clearInterval(interval);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isOpen]);

  if (!isOpen || !buttonPosition) return null;

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-40"
        onClick={onClose}
        style={{
          height: `${buttonPosition.top - 5}px`,
          background: "rgba(0, 0, 0, 0.8)",
        }}
      />

      <div
        className="fixed left-0 right-0 z-40"
        onClick={onClose}
        style={{
          top: `${buttonPosition.top - 5}px`,
          height: "10px",
          background:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))",
          filter: "blur(2px)",
        }}
      />

      <div
        className="fixed z-40"
        onClick={onClose}
        style={{
          top: `${buttonPosition.top - 10}px`,
          left: "0px",
          width: `${buttonPosition.left - 5}px`,
          height: `${buttonPosition.height + 20}px`,
          background: "rgba(0, 0, 0, 0.8)",
        }}
      />

      <div
        className="fixed z-40"
        onClick={onClose}
        style={{
          top: `${buttonPosition.top - 10}px`,
          left: `${buttonPosition.left - 5}px`,
          width: "10px",
          height: `${buttonPosition.height + 20}px`,
          background:
            "linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))",
          filter: "blur(2px)",
        }}
      />

      <div
        className="fixed z-40"
        onClick={onClose}
        style={{
          top: `${buttonPosition.top - 10}px`,
          left: `${buttonPosition.left + buttonPosition.width + 5}px`,
          right: "0px",
          height: `${buttonPosition.height + 20}px`,
          background: "rgba(0, 0, 0, 0.8)",
        }}
      />

      <div
        className="fixed z-40"
        onClick={onClose}
        style={{
          top: `${buttonPosition.top - 10}px`,
          left: `${buttonPosition.left + buttonPosition.width - 5}px`,
          width: "10px",
          height: `${buttonPosition.height + 20}px`,
          background:
            "linear-gradient(to left, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))",
          filter: "blur(2px)",
        }}
      />

      <div
        className="fixed left-0 right-0 bottom-0 z-40"
        onClick={onClose}
        style={{
          top: `${buttonPosition.top + buttonPosition.height + 5}px`,
          background: "rgba(0, 0, 0, 0.8)",
        }}
      />

      <div
        className="fixed left-0 right-0 z-40"
        onClick={onClose}
        style={{
          top: `${buttonPosition.top + buttonPosition.height - 5}px`,
          height: "10px",
          background:
            "linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))",
          filter: "blur(2px)",
        }}
      />

      <div
        className="fixed z-45"
        style={{
          top: `${buttonPosition.top - 10}px`,
          left: `${buttonPosition.left - 10}px`,
          width: `${buttonPosition.width + 20}px`,
          height: `${buttonPosition.height + 20}px`,
          borderRadius: "12px",
          boxShadow: "inset 0 0 0 2px rgba(255, 255, 255, 0.1)",
          pointerEvents: "none",
        }}
      />

      <div
        className="fixed first-run-modal"
        style={{
          zIndex: 60,
          top: `${buttonPosition.top - 90}px`,
          left: `${Math.max(20, buttonPosition.left - 50)}px`,
          right: `${Math.max(20, window.innerWidth - buttonPosition.left - buttonPosition.width - 50)}px`,
        }}
      >
        <div
          className="bg-primary text-center relative rounded-2xl"
          style={{
            padding: "16px",
            position: "relative",
            pointerEvents: "auto",
          }}
        >
          <p className="text-white text-base leading-relaxed font-medium">
            Сначала нужно настроить VPN на вашем устройстве
          </p>
          <div
            style={{
              position: "absolute",
              bottom: "-8px",
              left: `${buttonPosition.left + buttonPosition.width / 2 - Math.max(20, buttonPosition.left - 50)}px`,
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid #00a878",
            }}
          ></div>
        </div>
      </div>
    </>
  );
};

export default FirstRunModal;

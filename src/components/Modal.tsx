import React from "react";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className={`payment-modal-overlay ${isOpen ? "payment-modal-overlay--open" : ""}`}
        onClick={onClose}
      />
      <section className={`modal ${isOpen ? "modal--open" : ""} ${className}`}>
        <div className="payment-modal-content">
          <h3 className="payment-modal-title">{title}</h3>
          {children}
        </div>
      </section>
    </>
  );
};

export default Modal;

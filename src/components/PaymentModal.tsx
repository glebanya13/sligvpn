import React from "react";
import Modal from "./Modal";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type: "success" | "error";
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  message,
  type,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={""}
      className={`payment-modal payment-modal--${type}`}
    >
      <div className="payment-modal-content">
        <div className="payment-modal-icon" style={{ textAlign: "center" }}>
          {type === "success" ? "✅" : "❌"}
        </div>
        <p
          className="payment-modal-text"
          style={{ whiteSpace: "pre-line", textAlign: "center" }}
        >
          {message}
        </p>
        <div className="payment-payment-modal-buttons">
          <button
            className={`payment-modal-button payment-modal-button--${type === "success" ? "primary" : "secondary"}`}
            type="button"
            onClick={onClose}
          >
            {type === "success" ? "Отлично!" : "Понятно"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;

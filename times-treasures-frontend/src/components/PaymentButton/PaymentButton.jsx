// src/components/PaymentButton/PaymentButton.jsx

import React from 'react';
import styles from './PaymentButton.module.css';

const PaymentButton = ({ amount, onSuccess }) => {
  // This is a stub. In a real implementation, you would integrate with a payment gateway.
  const handleClick = () => {
    // Simulate a successful payment after a short delay
    setTimeout(() => {
      // Call the onSuccess callback with a simulated payment details object
      onSuccess({ status: 'COMPLETED', amount });
    }, 1000);
  };

  return (
    <button className={styles.paymentButton} onClick={handleClick}>
      Pay ${amount} Now
    </button>
  );
};

export default PaymentButton;

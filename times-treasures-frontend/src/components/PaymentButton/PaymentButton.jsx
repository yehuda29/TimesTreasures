// src/components/PaymentButton/PaymentButton.jsx

import React, { useEffect, useRef } from 'react';
import styles from './PaymentButton.module.css';

const PaymentButton = ({ amount, onSuccess, containerId = 'paypal-button-portal' }) => {
  // Ref to ensure we only render once
  const hasRendered = useRef(false);

  useEffect(() => {
    // If we've already rendered the buttons, do nothing
    if (hasRendered.current) return;

    // Find the portal container by its ID (this container should be defined in your Cart page)
    const portalElement = document.getElementById(containerId);
    if (!portalElement) {
      console.error(`No portal element found with id "${containerId}". Please add <div id="${containerId}"></div> in the desired location.`);
      return;
    }

    // Create a dedicated container for the PayPal buttons
    const container = document.createElement('div');
    container.className = styles.paymentButtonContainer;
    portalElement.appendChild(container);

    // Verify that the PayPal SDK is loaded
    if (!window.paypal) {
      console.error('PayPal SDK not loaded. Please include the PayPal SDK script in your index.html.');
      return;
    }

    // Render the PayPal buttons into the created container
    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: amount, // Use the provided amount
              },
            },
          ],
        });
      },
      onApprove: (data, actions) => {
        return actions.order
          .capture()
          .then((orderDetails) => {
            console.log('Order captured:', orderDetails);
            onSuccess(orderDetails);
          })
          .catch((err) => {
            console.error('Error capturing order:', err);
          });
      },
      onError: (err) => {
        console.error('PayPal Buttons onError:', err);
      },
    })
      .render(container)
      .then(() => {
        // Mark that the PayPal buttons have been rendered so we do not re‑render them
        hasRendered.current = true;
      })
      .catch((err) => {
        console.error('Error rendering PayPal buttons:', err);
      });

    // Cleanup: Remove the container on unmount to avoid leftover buttons
    return () => {
      if (portalElement.contains(container)) {
        portalElement.removeChild(container);
      }
    };
  }, [amount, onSuccess, containerId]);

  // This component renders nothing in the React tree
  return null;
};

export default PaymentButton;

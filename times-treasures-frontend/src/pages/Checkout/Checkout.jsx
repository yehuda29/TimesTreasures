// src/pages/Checkout/Checkout.jsx

import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PaymentButton from '../../components/PaymentButton/PaymentButton';
import { toast } from 'react-toastify'; // <-- Added import for toast
import styles from './Checkout.module.css';

const Checkout = () => {
  const { user, token } = useContext(AuthContext);
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // 'step' manages which stage of checkout we're on: address selection or review/payment
  const [step, setStep] = useState('address');
  // shippingAddress holds the address chosen or entered by the user
  const [shippingAddress, setShippingAddress] = useState(null);
  // For new address entry if the user doesn't want to use their saved address
  const [newAddress, setNewAddress] = useState({
    country: '',
    city: '',
    homeAddress: '',
    zipcode: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);

  // Helper for updating the new address form
  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  // Calculate total price from cart items
  const totalPrice = cartItems.reduce((acc, item) => {
    const price = item.watch?.price ? Number(item.watch.price) : 0;
    return acc + price * item.quantity;
  }, 0);

  // Handle payment success by calling the backend purchase endpoint
  const handlePaymentSuccess = async (orderDetails) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/purchase`,
        { shippingAddress },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      // If the response contains a message about out-of-stock items, display it
      if (response.data.message && response.data.message !== "Purchase completed successfully.") {
        toast.error(response.data.message);
      }
      clearCart(token);
      setLoading(false);
      navigate('/purchase-history');
    } catch (error) {
      setLoading(false);
      console.error('Checkout failed:', error);
      toast.error('Checkout failed. Please try again.');
    }
  };

  // Step 1: Render the address selection step
  const renderAddressStep = () => {
    return (
      <div className={styles.addressStep}>
        <h2>Shipping Address</h2>
        {user && user.addresses && user.addresses.length > 0 && (
          <div>
            <p>You have a saved address. Would you like to use it?</p>
            <button onClick={() => { 
              setShippingAddress(user.addresses[0]);
              setStep('review');
            }}>
              Use Saved Address
            </button>
          </div>
        )}
        <h3>Or enter a new address</h3>
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          setShippingAddress(newAddress); 
          setStep('review'); 
        }}>
          <input 
            type="text" 
            name="country" 
            placeholder="Country" 
            value={newAddress.country} 
            onChange={handleAddressChange} 
            required 
          />
          <input 
            type="text" 
            name="city" 
            placeholder="City" 
            value={newAddress.city} 
            onChange={handleAddressChange} 
            required 
          />
          <input 
            type="text" 
            name="homeAddress" 
            placeholder="Home Address" 
            value={newAddress.homeAddress} 
            onChange={handleAddressChange} 
            required 
          />
          <input 
            type="text" 
            name="zipcode" 
            placeholder="Zipcode" 
            value={newAddress.zipcode} 
            onChange={handleAddressChange} 
            pattern="\d+" 
            title="Zipcode must contain numbers only"
            required 
          />
          <input 
            type="text" 
            name="phoneNumber" 
            placeholder="Phone Number" 
            value={newAddress.phoneNumber} 
            onChange={handleAddressChange} 
            pattern="\d{10}" 
            maxLength="10"
            title="Phone number must be exactly 10 digits"
            required 
          />
          <button type="submit">Use This Address</button>
        </form>
      </div>
    );
  };

  // Step 2: Render the order review & payment step
  const renderReviewStep = () => {
    return (
      <div className={styles.reviewStep}>
        <h2>Order Summary</h2>
        <div>
          <h3>Shipping Address:</h3>
          <p>Country/State: {shippingAddress.country}</p>
          <p>City: {shippingAddress.city}</p>
          <p>Home Address: {shippingAddress.homeAddress}</p>
          <p>Zipcode: {shippingAddress.zipcode}</p>
          <p>Phone Number: {shippingAddress.phoneNumber}</p>
        </div>
        <div>
          <h3>Items:</h3>
          <ul>
            {cartItems.map((item, index) => (
              <li key={index}>
                {item.watch.name} x {item.quantity} - ${Number(item.watch.price).toFixed(2)}
              </li>
            ))}
          </ul>
          <h3>Total: ${totalPrice.toFixed(2)}</h3>
        </div>
        <p className={styles.shippingTime}>
          Estimated Shipping Time: 14 to 21 business days
        </p>
        <div id="paypal-button-portal">
          <PaymentButton 
            amount={totalPrice.toFixed(2)} 
            onSuccess={handlePaymentSuccess} 
            containerId="paypal-button-portal" 
          />
        </div>
        <button onClick={() => setStep('address')}>Edit Shipping Address</button>
      </div>
    );
  };

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.backButtonContainer}>
        <button className={styles.backBtn} onClick={() => navigate('/cart')}>
          Back to Cart
        </button>
      </div>
      {loading && <p>Processing your order...</p>}
      {step === 'address' && renderAddressStep()}
      {step === 'review' && shippingAddress && renderReviewStep()}
    </div>
  );
};

export default Checkout;

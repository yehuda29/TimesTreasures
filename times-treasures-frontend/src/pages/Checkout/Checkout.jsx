// src/pages/Checkout/Checkout.jsx
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PaymentButton from '../../components/PaymentButton/PaymentButton';
import { toast } from 'react-toastify';
import styles from './Checkout.module.css';
import { calculateFinalPrice } from '../../utils/priceUtil';

const Checkout = () => {
  const { user, token } = useContext(AuthContext);
  const { cartItems, clearCart, fetchCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Re-fetch the latest cart data when the checkout page loads.
  useEffect(() => {
    if (user && token) {
      fetchCart(token);
    }
  }, [user, token, fetchCart]);

  // 'step' manages the checkout process: 'address' or 'review'
  const [step, setStep] = useState('address');
  // shippingAddress will store the chosen address or pickup branch details
  const [shippingAddress, setShippingAddress] = useState(null);
  // For new address entry
  const [newAddress, setNewAddress] = useState({
    country: '',
    city: '',
    homeAddress: '',
    zipcode: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);

  // New state for branches (pickup option)
  const [branches, setBranches] = useState([]);

  // Fetch branches for pickup option
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/branches`);
        if (response.data && response.data.success) {
          setBranches(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching branches for pickup:", error);
      }
    };

    fetchBranches();
  }, []);

  // Update new address state
  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  // When a branch is selected, set it as the shipping address (pickup)
  const handleSelectBranch = (branch) => {
    // Map branch details to a shipping address structure.
    setShippingAddress({
      country: '', // Not applicable
      city: '',    // Not applicable
      homeAddress: branch.address || '',
      zipcode: '', // Not applicable
      phoneNumber: branch.phoneNumber,
      pickupBranch: true,
      branchName: branch.name,
      branchId: branch._id
    });
    setStep('review');
  };

  // Calculate total price from cart items
  const totalPrice = cartItems.reduce((acc, item) => {
    const unitPrice = calculateFinalPrice(item.watch);
    return acc + unitPrice * item.quantity;
  }, 0);

  // Handle payment success
  const handlePaymentSuccess = async (orderDetails) => {
    try {
      setLoading(true);
      await fetchCart(token);

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


// Inside Checkout.jsx
const renderAddressStep = () => {
  return (
    <div className={styles.addressStep}>
      <h2>Shipping Address</h2>
      {/* Option 1: Use Saved Address */}
      {user && user.addresses && user.addresses.length > 0 && (
        <div className={styles.savedAddress}>
          <p>You have a saved address. Would you like to use it?</p>
          <button onClick={() => { 
            setShippingAddress(user.addresses[0]);
            setStep('review');
          }}>
            Use Saved Address
          </button>
        </div>
      )}

      {/* Option 2: Pickup at a Branch */}
      <h3>Or pick up at a branch</h3>
      <div className={styles.branchSelection}>
        {branches.length > 0 ? (
          branches.map((branch) => (
            <div 
              key={branch._id} 
              className={styles.branchCard}
              onClick={() => handleSelectBranch(branch)}
            >
              <p><strong>{branch.name}</strong></p>
              {branch.address && <p>{branch.address}</p>}
              <p>{branch.phoneNumber}</p>
              <p>{branch.openingHour} - {branch.closingHour}</p>
            </div>
          ))
        ) : (
          <p>Loading branches...</p>
        )}
      </div>

      {/* Option 3: Enter a New Address */}
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




  // Render the review & payment step
  const renderReviewStep = () => {
    return (
      <div className={styles.reviewStep}>
        <h2>Order Summary</h2>
        <div>
          <h3>Shipping Address:</h3>
          {shippingAddress.pickupBranch ? (
            <>
              <p><strong>Pickup Branch:</strong> {shippingAddress.branchName}</p>
              <p>{shippingAddress.homeAddress}</p>
              <p>Phone: {shippingAddress.phoneNumber}</p>
            </>
          ) : (
            <>
              <p>Country/State: {shippingAddress.country}</p>
              <p>City: {shippingAddress.city}</p>
              <p>Home Address: {shippingAddress.homeAddress}</p>
              <p>Zipcode: {shippingAddress.zipcode}</p>
              <p>Phone Number: {shippingAddress.phoneNumber}</p>
            </>
          )}
        </div>
        <div>
          <h3>Items:</h3>
          <ul>
            {cartItems.map((item, index) => {
              const unitPrice = calculateFinalPrice(item.watch);
              return (
                <li key={index}>
                  {item.watch.name} x {item.quantity} - ₪ 
                  {(unitPrice * item.quantity).toFixed(2)}
                </li>
              );
            })}
          </ul>
          <h3>Total: ₪{(totalPrice).toFixed(2)}</h3>
        </div>
        <p className={styles.shippingTime}>
          {shippingAddress.pickupBranch 
            ? "Please pick up your order at the selected branch."
            : "Estimated Shipping Time: 14 to 21 business days"}
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

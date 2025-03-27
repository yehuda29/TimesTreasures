import React, { useContext, useState, useEffect } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import PaymentButton from '../../components/PaymentButton/PaymentButton';
import { toast } from 'react-toastify';
import styles from './Checkout.module.css';
import { calculateFinalPrice } from '../../utils/priceUtil';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Checkout = () => {
  const { user, token } = useContext(AuthContext);
  const { cartItems, clearCart, fetchCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [step, setStep] = useState('address');
  const [shippingAddress, setShippingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    country: '',
    city: '',
    homeAddress: '',
    zipcode: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    if (user && token) {
      fetchCart(token);
    }
  }, [user, token, fetchCart]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/branches`);
        if (response.data?.success) {
          setBranches(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching branches for pickup:", error);
      }
    };
    fetchBranches();
  }, []);

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleSelectBranch = (branch) => {
    setShippingAddress({
      country: '',
      city: '',
      homeAddress: branch.address || '',
      zipcode: '',
      phoneNumber: branch.phoneNumber,
      pickupBranch: true,
      branchName: branch.name,
      branchId: branch._id
    });
    setStep('review');
  };

  const totalPrice = cartItems.reduce((acc, item) => {
    const unitPrice = calculateFinalPrice(item.watch);
    return acc + unitPrice * item.quantity;
  }, 0);

  const handlePaymentSuccess = async () => {
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

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,          // Only 2 slides on screen at once
    slidesToScroll: 1,
    swipeToSlide: true,
    centerMode: true,
    centerPadding: '5px',     // Reduced center padding
  };
  
  const renderAddressStep = () => {
    return (
      <div className={styles.addressStep}>
        <h2>Shipping Address</h2>
        {user && user.addresses?.length > 0 && (
          <div className={styles.savedAddress}>
            <p>You have a saved address. Would you like to use it?</p>
            <button
              onClick={() => {
                setShippingAddress(user.addresses[0]);
                setStep('review');
              }}
            >
              Use Saved Address
            </button>
          </div>
        )}

        <h3>Or pick up at a branch</h3>
        <br></br>
        <div className={styles.branchCarousel}>
          {branches.length > 0 ? (
            <Slider {...carouselSettings}>
              {branches.map((branch) => (
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
              ))}
            </Slider>
          ) : (
            <p>Loading branches...</p>
          )}
        </div>
        <br></br>
        <h3>Or enter a new address</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShippingAddress(newAddress);
            setStep('review');
          }}
        >
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

  const renderReviewStep = () => {
    return (
      <div className={styles.reviewStep}>
        <h2>Order Summary</h2>
        {shippingAddress.pickupBranch ? (
          <>
            <h3>Pickup Branch:</h3>
            <p><strong>{shippingAddress.branchName}</strong></p>
            <p>{shippingAddress.homeAddress}</p>
            <p>Phone: {shippingAddress.phoneNumber}</p>
          </>
        ) : (
          <>
            <h3>Shipping Address:</h3>
            <p>Country/State: {shippingAddress.country}</p>
            <p>City: {shippingAddress.city}</p>
            <p>Home Address: {shippingAddress.homeAddress}</p>
            <p>Zipcode: {shippingAddress.zipcode}</p>
            <p>Phone Number: {shippingAddress.phoneNumber}</p>
          </>
        )}

        <div>
          <h3>Items:</h3>
          <ul>
            {cartItems.map((item, index) => {
              const unitPrice = calculateFinalPrice(item.watch);
              return (
                <li key={index}>
                  {item.watch.name} x {item.quantity} - $
                  {(unitPrice * item.quantity).toFixed(2)}
                </li>
              );
            })}
          </ul>
          <h3>Total: ${totalPrice.toFixed(2)}</h3>
        </div>

        <p className={styles.shippingTime}>
          {shippingAddress.pickupBranch
            ? 'Please pick up your order at the selected branch.'
            : 'Estimated Shipping Time: 14 to 21 business days'}
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

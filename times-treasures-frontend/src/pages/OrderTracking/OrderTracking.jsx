import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import styles from './OrderTracking.module.css';

const OrderTracking = () => {
  // State variables for the order number input, fetched order data, and UI states
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingDays, setRemainingDays] = useState(null);

  // Function to handle form submission and fetch the order details using the order number.
  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    setRemainingDays(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/track-order/${orderNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(response.data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order. Please check the order number.');
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate remaining days until delivery:
  // (purchaseDate + 21 days) - current date.
  const calculateRemainingDays = (purchaseDate) => {
    const deliveryDate = new Date(purchaseDate);
    deliveryDate.setDate(deliveryDate.getDate() + 21);
    const diffTime = deliveryDate - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // When an order is fetched, update the remainingDays state.
  useEffect(() => {
    if (order) {
      const days = calculateRemainingDays(order.purchaseDate);
      setRemainingDays(days);
    }
  }, [order]);

  return (
    <Container maxWidth="sm" sx={{ marginTop: '2rem' }}>
      <Paper sx={{ padding: '2rem', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Order Tracking
        </Typography>
        <form onSubmit={handleTrackOrder}>
          <TextField
            label="Enter Order Number"
            variant="outlined"
            fullWidth
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
            sx={{ marginBottom: '1rem' }}
          />
          <Button type="submit" variant="contained" color="primary">
            Track Order
          </Button>
        </form>

        {loading && (
          <Box sx={{ marginTop: '2rem' }}>
            <Typography variant="body1">Fetching order details...</Typography>
          </Box>
        )}

        {error && (
          <Typography variant="body1" color="error" sx={{ marginTop: '1rem' }}>
            {error}
          </Typography>
        )}

        {order && (
          <Box sx={{ marginTop: '2rem' }}>
            <Typography variant="h6">Order Number: {order.orderNumber}</Typography>
            {remainingDays > 0 ? (
              <>
                {/* Truck animation container */}
                <Box className={styles.truckContainer}>
                  <div className={styles.track}></div>
                  <LocalShippingIcon className={styles.truckIcon} fontSize="large" color="primary" />
                </Box>
                <Typography variant="body1" sx={{ marginTop: '1rem' }}>
                  {remainingDays} {remainingDays === 1 ? 'day' : 'days'} remaining until delivery.
                </Typography>
              </>
            ) : (
              <Typography variant="h5" color="success.main" sx={{ marginTop: '1rem' }}>
                Your order has arrived!
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default OrderTracking;

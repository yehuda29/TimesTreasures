import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Typography, Paper, Box, TextField } from '@mui/material';
import { ProgressBar } from 'react-bootstrap';
import Confetti from 'react-confetti';

// 21 days in ms
const TOTAL_21_DAYS_MS = 21 * 24 * 60 * 60 * 1000;

const OrderTracking = () => {
  // Basic states
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Countdown & confetti
  const [timeLeftMs, setTimeLeftMs] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Real shipping progress, 0..100
  const [progressValue, setProgressValue] = useState(0);

  // Submit the order number
  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    setTimeLeftMs(null);
    setProgressValue(0);
    setShowConfetti(false);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/track-order/${orderNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(response.data.order);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to fetch order. Please check the order number.'
      );
    } finally {
      setLoading(false);
    }
  };

  // arrival date = purchaseDate + 21 days
  const getArrivalDate = (purchaseDateString) => {
    const purchaseDate = new Date(purchaseDateString);
    purchaseDate.setDate(purchaseDate.getDate() + 21);
    return purchaseDate;
  };

  // Shipping countdown once we have an order
  useEffect(() => {
    if (!order) return;

    const arrivalDate = getArrivalDate(order.purchaseDate);
    const now = new Date();
    const initialDiff = arrivalDate - now;

    if (initialDiff <= 0) {
      // Already arrived
      setTimeLeftMs(0);
      setProgressValue(100);
      setShowConfetti(true);
      return;
    }

    setTimeLeftMs(initialDiff);

    const intervalId = setInterval(() => {
      const newDiff = arrivalDate - new Date();
      if (newDiff <= 0) {
        setTimeLeftMs(0);
        setProgressValue(100);
        setShowConfetti(true);
        clearInterval(intervalId);
      } else {
        setTimeLeftMs(newDiff);
        const fractionElapsed = 1 - newDiff / TOTAL_21_DAYS_MS;
        const realPct = Math.min(Math.max(fractionElapsed, 0), 1) * 100;
        setProgressValue(realPct);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [order]);

  // Format timeLeftMs as "DD:HH:MM:SS"
  const renderTimer = () => {
    if (timeLeftMs == null) return null;
    if (timeLeftMs <= 0) return '00:00:00:00';

    const totalSec = Math.floor(timeLeftMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const dd = String(days).padStart(2, '0');
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return `${dd}:${hh}:${mm}:${ss}`;
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: '2rem' }}>
      {showConfetti && <Confetti />}

      <Paper sx={{ padding: '2rem', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Order Tracking
        </Typography>

        {/* Input order number */}
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
            <Typography>Fetching order details...</Typography>
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ marginTop: '1rem' }}>
            {error}
          </Typography>
        )}

        {order && (
          <Box sx={{ marginTop: '2rem' }}>
            <Typography variant="h6">
              Order Number: {order.orderNumber}
            </Typography>

            <Typography sx={{ marginTop: '0.5rem' }}>
              <strong>Purchase Date:</strong>{' '}
              {new Date(order.purchaseDate).toLocaleString()}
            </Typography>

            <Typography sx={{ marginTop: '0.5rem' }}>
              <strong>Arrival Date:</strong>{' '}
              {getArrivalDate(order.purchaseDate).toLocaleString()}
            </Typography>

            {timeLeftMs > 0 ? (
              <>
                {/* react-bootstrap animated progress bar */}
                <Box sx={{ marginY: '1.5rem' }}>
                  <ProgressBar
                    now={progressValue}
                    animated
                    label={`${progressValue.toFixed(0)}%`}
                    style={{ height: '24px', fontSize: '1rem' }}
                  />
                </Box>

                <Typography variant="h6" sx={{ marginTop: '1rem' }}>
                  Time Remaining:
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}
                >
                  {renderTimer()}
                </Typography>
              </>
            ) : (
              <Typography
                variant="h5"
                color="success.main"
                sx={{ marginTop: '1rem', fontWeight: 'bold' }}
              >
                Your order has arrived!
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default OrderTracking;
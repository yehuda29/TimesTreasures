

const express = require('express');
const asyncHandler = require('express-async-handler');
const { client } = require('../paypalClient');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Endpoint to create a PayPal order
router.post('/create-order', protect, asyncHandler(async (req, res, next) => {
  const { amount } = req.body; // Expect amount as a string, e.g., "25.00"
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: amount,
        },
      },
    ],
  });

  try {
    const order = await client().execute(request);
    res.status(201).json({ success: true, orderID: order.result.id });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}));

// Endpoint to capture a PayPal order
router.post('/capture-order', protect, asyncHandler(async (req, res, next) => {
  const { orderID } = req.body;
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client().execute(request);

    // Clear the user's cart after successful capture
    const user = await User.findById(req.user.id);
    if (user) {
      user.cart = [];
      await user.save();
    }

    res.status(200).json({ success: true, capture: capture.result });
  } catch (error) {
    console.error("Error capturing order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}));

module.exports = router;

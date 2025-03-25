// Import the Express framework to create the router.
const express = require('express');
// Import asyncHandler to simplify error handling in asynchronous route handlers.
const asyncHandler = require('express-async-handler');
// Import the client function from our PayPal client module to execute API requests.
const { client } = require('../paypalClient');
// Import the PayPal Checkout Server SDK to construct requests.
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
// Import the protect middleware to secure routes (ensure the user is authenticated).
const { protect } = require('../middleware/auth');
// Import the User model to clear the user's cart after a successful purchase.
const User = require('../models/User');

// Create an Express router instance.
const router = express.Router();

/**
 * @route   POST /api/paypal/create-order
 * @desc    Create a new PayPal order for the specified amount.
 * @access  Private (requires authentication via protect middleware)
 */
router.post(
  '/create-order',
  protect,
  asyncHandler(async (req, res, next) => {
    // Extract the amount (as a string, e.g., "25.00") from the request body.
    const { amount } = req.body;

    // Create a new OrdersCreateRequest object from the PayPal SDK.
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    
    // Ask for a full response representation of the order.
    request.prefer("return=representation");
    
    // Set the request body for creating the order.
    request.requestBody({
      intent: 'CAPTURE', // Specify that the intent is to capture payment immediately.
      purchase_units: [
        {
          amount: {
            currency_code: 'ILS', // Use ILS as the currency.
            value: amount,        // Set the amount to be charged.
          },
        },
      ],
    });

    try {
      // Execute the order creation request using our PayPal client.
      const order = await client().execute(request);
      // Respond with a 201 status code and return the order ID.
      res.status(201).json({ success: true, orderID: order.result.id });
    } catch (error) {
      // Log any errors and respond with a 500 error status.
      console.error("Error creating order:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

/**
 * @route   POST /api/paypal/capture-order
 * @desc    Capture an approved PayPal order. After successful capture, clear the user's cart.
 * @access  Private (requires authentication via protect middleware)
 */
router.post(
  '/capture-order',
  protect,
  asyncHandler(async (req, res, next) => {
    // Extract the orderID from the request body.
    const { orderID } = req.body;

    // Create a new OrdersCaptureRequest object using the provided orderID.
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    
    // Set an empty request body (required by the SDK).
    request.requestBody({});

    try {
      // Execute the order capture request.
      const capture = await client().execute(request);

      // After a successful capture, clear the user's persistent cart.
      // Find the user by the ID provided in req.user (populated by the protect middleware).
      const user = await User.findById(req.user.id);
      if (user) {
        // Clear the user's cart by setting it to an empty array.
        user.cart = [];
        // Save the updated user document.
        await user.save();
      }

      // Respond with a 200 status code and return the capture result.
      res.status(200).json({ success: true, capture: capture.result });
    } catch (error) {
      // Log any errors and respond with a 500 error status.
      console.error("Error capturing order:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Export the router so it can be mounted in the main server file.
module.exports = router;

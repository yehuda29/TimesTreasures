// watch-shop-backend/controllers/userController.js
// Purpose: Contains user-related actions beyond authentication, such as retrieving a user's purchase history,
// managing the persistent cart, and processing purchases.

const mongoose = require('mongoose'); // Import Mongoose for MongoDB interactions.
const User = require('../models/User'); // Import the User model.
const asyncHandler = require('express-async-handler'); // Utility to handle async errors in route handlers.
const Watch = require('../models/Watch'); // Import the Watch model, used to verify watch existence in cart items.
const cloudinary = require('../cloudinaryConfig'); // Import Cloudinary config
const nodemailer = require('nodemailer');

// -----------------------------------------------------------------------------
// Setup Nodemailer Transporter
// -----------------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  service: 'Gmail', // You can replace this with another service such as SendGrid or Mailgun in production
  auth: {
    user: process.env.EMAIL_USER,  // Your email address from environment variables
    pass: process.env.EMAIL_PASS   // Your email password or API key from environment variables
  }
});

// -----------------------------------------------------------------------------
// Function: sendReceiptEmail
// Purpose: Send an email receipt to the user after a successful purchase.
// -----------------------------------------------------------------------------
const sendReceiptEmail = async (userEmail, purchaseDetails) => {
  // Build the HTML content for the receipt email
  const emailContent = `
    <h2>Thank you for your purchase!</h2>
    <p>Here is your receipt:</p>
    <h3>Shipping Address:</h3>
    <p>Country/State: ${purchaseDetails.shippingAddress.country}</p>
    <p>City: ${purchaseDetails.shippingAddress.city}</p>
    <p>Home Address: ${purchaseDetails.shippingAddress.homeAddress}</p>
    <p>Zipcode: ${purchaseDetails.shippingAddress.zipcode}</p>
    <p>Phone Number: ${purchaseDetails.shippingAddress.phoneNumber}</p>
    <h3>Items Purchased:</h3>
    <ul>
      ${purchaseDetails.items.map(item => `<li>${item.name} x ${item.quantity} - $${Number(item.price).toFixed(2)}</li>`).join('')}
    </ul>
    <h3>Total: $${purchaseDetails.total.toFixed(2)}</h3>
    <p>Estimated Shipping Time: 14 to 21 days</p>
  `;

  // Define email options including the sender, recipient, subject, and HTML content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your Purchase Receipt',
    html: emailContent
  };

  // Send the email using the transporter; if it fails, the error is logged
  await transporter.sendMail(mailOptions);
};

// -----------------------------------------------------------------------------
// GET PURCHASE HISTORY
// -----------------------------------------------------------------------------
// @desc    Get purchase history for the logged-in user
// @route   GET /api/users/purchase-history
// @access  Private
exports.getPurchaseHistory = asyncHandler(async (req, res, next) => {
  // Find the user and populate the 'watch' field for each purchase record
  const user = await User.findById(req.user.id).populate('purchaseHistory.watch');
  
  // Filter out any purchase records where the watch has been deleted (i.e. is null)
  const filteredPurchaseHistory = user.purchaseHistory.filter(
    (purchase) => purchase.watch !== null
  );
  
  res.status(200).json({
    success: true,
    data: filteredPurchaseHistory
  });
});


// -----------------------------------------------------------------------------
// GET PERSISTENT CART
// -----------------------------------------------------------------------------
// @desc    Get the persistent cart for the logged-in user
// @route   GET /api/users/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  // Find the user by their ID and populate the 'watch' field within the cart items
  const user = await User.findById(req.user.id).populate('cart.watch');
  
  // Log the fetched cart for debugging purposes.
  console.log("Fetched cart for user:", req.user.id, "Cart:", user.cart);
  
  // Return the user's cart in the response.
  res.status(200).json({
    success: true,
    data: user.cart
  });
});

// -----------------------------------------------------------------------------
// UPDATE PERSISTENT CART
// -----------------------------------------------------------------------------
// @desc    Update the persistent cart for the logged-in user
// @route   POST /api/users/cart
// @access  Private
exports.updateCart = asyncHandler(async (req, res, next) => {
  // Destructure the 'cart' array from the request body.
  const { cart } = req.body;
  
  // Validate that "cart" is an array.
  if (!Array.isArray(cart)) {
    res.status(400);
    throw new Error('Cart must be an array');
  }

  // Log the cart payload for debugging.
  console.log("Updating cart for user:", req.user.id, "Cart payload:", cart);

  // Process and validate each item in the incoming cart array.
  // For each cart item, we verify that it includes a valid watch ID and a positive quantity.
  const updatedCart = await Promise.all(
    cart.map(async (item) => {
      // Ensure the item includes a watch field.
      if (!item.watch) {
        throw new Error('Each cart item must have a watch field');
      }
      // Ensure the quantity is a positive number.
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        throw new Error('Quantity must be a positive number');
      }
      let watchId;
      try {
        // Convert the watch field to a valid MongoDB ObjectId.
        watchId = new mongoose.Types.ObjectId(item.watch);
      } catch (err) {
        console.error("Invalid watch ID:", item.watch, err);
        throw new Error(`Invalid watch ID: ${item.watch}`);
      }
      // verify that the watch exists in the database.
      const existingWatch = await Watch.findById(watchId);
      if (!existingWatch) {
        throw new Error(`Watch not found for ID: ${item.watch}`);
      }
      // Return a new object containing the watch reference and its quantity.
      return { watch: watchId, quantity: item.quantity };
    })
  );

  // Atomically update the user's cart using the $set operator.
  // This replaces the existing cart with the validated updated cart.
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { cart: updatedCart } },
    { new: true, runValidators: true } // Return the updated document and run schema validations.
  ).populate('cart.watch'); // Populate the 'watch' field for the updated cart items.

  if (!updatedUser) {
    res.status(404);
    throw new Error('User not found');
  }

  // Log the updated cart for debugging purposes.
  console.log("Updated cart for user:", req.user.id, "Cart:", updatedUser.cart);

  // Return the updated cart in the response.
  res.status(200).json({
    success: true,
    data: updatedUser.cart
  });
});

// -----------------------------------------------------------------------------
// Controller: purchaseCart
// Purpose: Process all items in the user's persistent cart, add them to the purchase
//          history (including the shipping address), clear the cart, and send a receipt email.
// Route:   POST /api/users/purchase
// Access:  Private
// -----------------------------------------------------------------------------
exports.purchaseCart = asyncHandler(async (req, res, next) => {
  // Extract the shippingAddress from the request body (provided by the checkout process)
  const { shippingAddress } = req.body;

  // Find the user by ID and populate the 'cart.watch' field to have full watch details
  const user = await User.findById(req.user.id).populate('cart.watch');

  // Check if the user exists
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  // Check if the cart is empty
  if (!user.cart || user.cart.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Initialize variables to compute the receipt details
  let total = 0;
  const items = [];

  // Process each item in the cart:
  // - Calculate total price for each item
  // - Push details into the items array for the email receipt
  // - Add a new purchase record to the user's purchaseHistory, including the shipping address
  user.cart.forEach((item) => {
    const itemTotal = item.quantity * (item.watch.price || 0);
    total += itemTotal;

    // Add item details to the receipt details
    items.push({
      name: item.watch.name,
      quantity: item.quantity,
      price: item.watch.price
    });

    // Add purchase record; we include shippingAddress here so each order record remains immutable
    user.purchaseHistory.push({
      watch: item.watch._id,
      quantity: item.quantity,
      totalPrice: itemTotal,
      purchaseDate: new Date(),
      shippingAddress: shippingAddress
    });
  });

  // Clear the user's persistent cart after processing the purchase
  user.cart = [];
  
  // Save the updated user document with the new purchase history and empty cart
  await user.save();

  // Build an object with purchase details for the email receipt
  const purchaseDetails = {
    shippingAddress,
    items,
    total
  };

  // Asynchronously send the receipt email to the user.
  // This operation is not awaited to avoid delaying the response.
  sendReceiptEmail(user.email, purchaseDetails)
    .then(() => console.log('Receipt email sent successfully'))
    .catch(err => console.error('Error sending receipt email:', err));

  // Return a response with the updated purchase history
  res.status(200).json({
    success: true,
    data: user.purchaseHistory
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, addresses } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (addresses) updates.addresses = addresses;

  // Check if a new profile picture file is uploaded via req.files.profilePicture
  if (req.files && req.files.profilePicture) {
    try {
      const result = await cloudinary.uploader.upload(req.files.profilePicture.tempFilePath, {
        folder: 'profilePictures'
      });
      updates.profilePicture = result.secure_url;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      return res.status(500).json({
        success: false,
        message: 'Error uploading profile picture'
      });
    }
  } else if (req.body.profilePicture) {
    // Alternatively, if a URL is provided directly in the body, use it.
    updates.profilePicture = req.body.profilePicture;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});


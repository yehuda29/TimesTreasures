// watch-shop-backend/controllers/userController.js
// Purpose: Contains user-related actions beyond authentication, such as retrieving a user's purchase history,
// managing the persistent cart, and processing purchases.

const mongoose = require('mongoose'); // Import Mongoose for MongoDB interactions.
const User = require('../models/User'); // Import the User model.
const asyncHandler = require('express-async-handler'); // Utility to handle async errors in route handlers.
const Watch = require('../models/Watch'); // Import the Watch model, used to verify watch existence in cart items.
const cloudinary = require('../cloudinaryConfig'); // Import Cloudinary config
const nodemailer = require('nodemailer');


/*
req (short for request):
      Represents the HTTP request object.
      Contains information about the incoming request such as headers, query parameters, 
      body data (for POST/PUT requests), and URL parameters.
res (short for response):
      Represents the HTTP response object.
      Used to send data back to the client—for example, sending JSON, HTML, or other types of responses.
      Provides methods like res.status(), res.json(), res.send(), etc.

next (short for “next middleware”):
      A function that, when called, moves the request handling process to the next middleware
      or next route handler in the chain.
      Often used for error handling—if you pass an error to next(), 
      Express knows to move on to the error-handling middleware.


 */



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
    <p>Phone Number: ${purchaseDetails.phoneNumber}</p>
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
  const user = await User.findById(req.user.id).populate('cart.watch');

  console.log("🛒 Debugging Cart Data for User:", req.user.id);
  console.log("Fetched cart from DB:", JSON.stringify(user.cart, null, 2));

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
  const { cart } = req.body;

  if (!Array.isArray(cart)) {
    console.error("❌ Cart update failed: Cart must be an array");
    return res.status(400).json({ success: false, message: "Cart must be an array" });
  }

  console.log("📡 Incoming Cart Update for User:", req.user.id);
  console.log("📦 Cart Payload:", JSON.stringify(cart, null, 2));

  const validCart = [];

  for (const item of cart) {
    if (!item.watch) {
      console.log("🚨 Skipping invalid cart item: Missing watch field", item);
      continue;
    }

    let watchId = item.watch;

    if (typeof watchId === "object" && watchId._id) {
      console.warn(`⚠️ watchId is an object instead of a string: ${JSON.stringify(watchId)}`);
      watchId = watchId._id;
    }

    if (typeof watchId === "string") {
      console.log(`🔄 Converting watch ID string to ObjectId: ${watchId}`);
      try {
        watchId = new mongoose.Types.ObjectId(watchId);
      } catch (err) {
        console.error("🚨 Invalid watch ID format:", watchId, err);
        continue;
      }
    }

    console.log(`🔍 Checking database for watch ID: ${watchId}`);

    const existingWatch = await Watch.findById(watchId);
    if (!existingWatch) {
      console.log(`🚨 Watch not found in DB for ID: ${watchId}`);
      continue;
    }

    console.log(`✅ Found watch in DB: ${existingWatch.name}`);
    validCart.push({ watch: watchId, quantity: item.quantity });
  }

  console.log("✅ Cleaned Cart Before Saving:", JSON.stringify(validCart, null, 2));

  // Save the updated cart to the user profile
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { cart: validCart } },
    { new: true, runValidators: true }
  ).populate("cart.watch");

  if (!updatedUser) {
    console.error("❌ Cart update failed: User not found");
    return res.status(404).json({ success: false, message: "User not found" });
  }

  console.log("✅ Cart Successfully Updated in DB:", JSON.stringify(updatedUser.cart, null, 2));

  res.status(200).json({
    success: true,
    data: updatedUser.cart,
  });
});


// Helper function to generate an 11-digit random order number as a string
const generateOrderNumber = () => {
  let orderNum = '';
  for (let i = 0; i < 11; i++) {
    orderNum += Math.floor(Math.random() * 10); // Append a random digit (0-9)
  }
  return orderNum;
};

// -----------------------------------------------------------------------------
// Controller: purchaseCart
// Purpose: Process all items in the user's persistent cart, add them to the purchase
//          history (including shipping address and a generated order number),
//          clear the cart, and send a receipt email.
// Route:   POST /api/users/purchase
// Access:  Private
// -----------------------------------------------------------------------------
exports.purchaseCart = asyncHandler(async (req, res, next) => {
  // Extract the shippingAddress from the request body (provided by the checkout process)
  const { shippingAddress } = req.body;
  
  // Find the user by ID and populate the 'cart.watch' field to have full watch details
  const user = await User.findById(req.user.id).populate('cart.watch');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (!user.cart || user.cart.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Ensure any existing purchase history records have an orderNumber
  user.purchaseHistory.forEach(doc => {
    if (!doc.orderNumber) {
      doc.orderNumber = generateOrderNumber();
    }
  });

  let total = 0;
  const items = [];
  // Array to keep track of any watches that are out of stock
  const outOfStockItems = [];

  // Process each cart item
  for (const item of user.cart) {
    const watchDoc = item.watch;
    // Check if the available inventory is less than the desired quantity
    if (watchDoc.inventory < item.quantity) {
      // Record the watch name for the out-of-stock message
      outOfStockItems.push(watchDoc.name);
      // Skip processing this item
      continue;
    } else {
      // Sufficient inventory: decrement the inventory by the purchased quantity
      await Watch.findByIdAndUpdate(watchDoc._id, { $inc: { inventory: -item.quantity } });
      
      // Calculate final price considering any valid special offer discount
      let finalPrice = watchDoc.price;
      if (watchDoc.specialOffer && watchDoc.specialOffer.discountPercentage > 0) {
        // Ensure both offerStart and offerEnd are defined
        if (watchDoc.specialOffer.offerStart && watchDoc.specialOffer.offerEnd) {
          const now = new Date();
          const start = new Date(watchDoc.specialOffer.offerStart);
          const end = new Date(watchDoc.specialOffer.offerEnd);
          // Apply discount if current date is within the offer period
          if (now >= start && now <= end) {
            finalPrice = watchDoc.price * (1 - watchDoc.specialOffer.discountPercentage / 100);
          }
        }
      }
      
      // Calculate the total for this item based on the final (possibly discounted) price
      const itemTotal = item.quantity * finalPrice;
      total += itemTotal;

      // Prepare item details for the receipt email using the discounted price
      items.push({
        name: watchDoc.name,
        quantity: item.quantity,
        price: finalPrice
      });

      // Record the purchase in the user's purchase history,
      // including a generated order number for order tracking.
      user.purchaseHistory.push({
        watch: watchDoc._id,
        quantity: item.quantity,
        totalPrice: itemTotal,
        purchaseDate: new Date(),
        shippingAddress: shippingAddress,
        orderNumber: generateOrderNumber() // Generate and add the order number here
      });
    }
  }

  // Clear the cart (both purchased and out-of-stock items are removed)
  user.cart = [];
  await user.save();

  const purchaseDetails = {
    shippingAddress,
    items,
    total,
    phoneNumber: user.phoneNumber
  };

  // Asynchronously send the receipt email (not awaited to avoid delaying the response)
  sendReceiptEmail(user.email, purchaseDetails)
    .then(() => console.log('Receipt email sent successfully'))
    .catch(err => console.error('Error sending receipt email:', err));

  // Build a response message. If any items were out of stock, include their names.
  let responseMessage = "Purchase completed successfully.";
  if (outOfStockItems.length > 0) {
    responseMessage = `The following watches were out of stock and have been removed from your cart: ${outOfStockItems.join(', ')}`;
  }

  res.status(200).json({
    success: true,
    data: user.purchaseHistory,
    message: responseMessage
  });
});



exports.updateProfile = asyncHandler(async (req, res, next) => {
  // Destructure fields from the request body, including the new ones.
  const { name, familyName, birthDate, sex, addresses, phoneNumber } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (familyName) updates.familyName = familyName;
  if (birthDate) updates.birthDate = birthDate; // Ensure birthDate is in the proper format (or convert it to a Date)
  if (sex) updates.sex = sex;
  if (addresses) updates.addresses = addresses;
  if (phoneNumber) updates.phoneNumber = phoneNumber;

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

  // Update the user document with the new information
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


/**
 * @desc    Track an order by order number from the logged-in user's purchase history.
 * @route   GET /api/users/track-order/:orderNumber
 * @access  Private
 */
exports.trackOrder = asyncHandler(async (req, res, next) => {
  const { orderNumber } = req.params;

  // Find the current user (no need to populate purchaseHistory as it is embedded)
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Find the purchase record with the matching order number
  const order = user.purchaseHistory.find(purchase => purchase.orderNumber === orderNumber);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // Return the order record
  res.status(200).json({ success: true, order });
});

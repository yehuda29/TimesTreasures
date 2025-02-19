// Import the PayPal Checkout Server SDK package,
// which provides tools to integrate with PayPal's REST APIs.
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

/**
 * Creates and returns the appropriate PayPal environment instance
 * (Sandbox or Live) based on the current NODE_ENV setting.
 *
 * The environment object holds your client credentials and is used by the PayPal SDK
 * to make authorized API calls.
 *
 * @returns {SandboxEnvironment|LiveEnvironment} The environment instance for PayPal.
 */
function environment() {
  // Retrieve the PayPal client ID from environment variables.
  const clientId = process.env.PAYPAL_CLIENT_ID;
  
  // Retrieve the PayPal client secret from environment variables.
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  // Check if the application is running in production.
  // If so, use the LiveEnvironment; otherwise, use the SandboxEnvironment.
  if (process.env.NODE_ENV === 'production') {
    // In production, use the live PayPal environment with your client credentials.
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  } else {
    // In non-production environments, use the sandbox environment.
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
  }
}

/**
 * Creates and returns a PayPal HTTP client instance.
 *
 * This client is used to send requests to PayPal's APIs. It automatically
 * uses the environment (Sandbox or Live) that was configured in the environment() function.
 *
 * @returns {PayPalHttpClient} An instance of the PayPal HTTP client.
 */
function client() {
  // Create a new PayPalHttpClient using the environment created by the environment() function.
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

// Export the client function so that it can be imported and used in other parts of your application.
module.exports = { client };

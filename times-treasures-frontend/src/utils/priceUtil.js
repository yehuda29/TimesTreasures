// src/utils/priceUtil.js

/**
 * Calculates the final price for a watch, taking into account any active special offer.
 * If a special offer is active (discount > 0 and current date is between offerStart and offerEnd),
 * this function returns the discounted price; otherwise, it returns the original price.
 *
 * @param {Object} watch - The watch object, expected to have 'price' and 'specialOffer' fields.
 * @returns {Number} - The final price after discount (if any).
 */
export function calculateFinalPrice(watch) {
    if (!watch) return 0;
    
    const originalPrice = Number(watch.price) || 0;
    
    // Check if there is a valid specialOffer with a discount greater than 0 and valid dates
    if (
      watch.specialOffer &&
      Number(watch.specialOffer.discountPercentage) > 0 &&
      watch.specialOffer.offerStart &&
      watch.specialOffer.offerEnd
    ) {
      const now = new Date();
      const start = new Date(watch.specialOffer.offerStart);
      const end = new Date(watch.specialOffer.offerEnd);
      if (now >= start && now <= end) {
        return originalPrice * (1 - Number(watch.specialOffer.discountPercentage) / 100);
      }
    }
    
    return originalPrice;
  }
  
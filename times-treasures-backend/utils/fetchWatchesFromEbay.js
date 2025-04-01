// times-treasures-backend/utils/fetchWatchesFromEbay.js

const axios = require("axios");
require("dotenv").config();

/**
 * Enhanced helper function to extract the watch brand/model from the title.
 * If an admin-provided brand (adminBrand) is given and is found anywhere in the title (case-insensitive),
 * the function returns the adminBrand. Otherwise, it falls back to returning the first word of the title.
 * If no title is provided, it returns 'Unknown Brand'.
 *
 * @param {string} title - The full title of the eBay listing.
 * @param {string} adminBrand - The brand name provided by the admin to filter by.
 * @returns {string} - The determined brand name.
 */
function extractBrand(title, adminBrand = "") {
  if (!title) return 'Unknown Brand';

  // If the admin has provided a brand and it appears anywhere in the title, return the admin brand.
  if (adminBrand && title.toLowerCase().includes(adminBrand.toLowerCase())) {
    return adminBrand;
  }
  
  // Otherwise, fall back to using the first word of the title as the brand.
  const words = title.split(' ');
  return words[0] || 'Unknown Brand';
}

/**
 * Fetches watches from eBay based on the search query and optional brand filter.
 * @param {string} query - The search query for eBay.
 * @param {string} brand - The desired brand filter (e.g., "Rolex"). Only watches whose title includes this brand will be returned.
 * @param {number} limit - The maximum number of watches to fetch.
 * @returns {Array} An array of valid watch objects.
 */
const fetchWatchesFromEbay = async (query = "wrist watch", brand = "", limit = 10) => {
  try {
    const EBAY_ENV = process.env.EBAY_ENVIRONMENT || "production";
    const EBAY_API_URL =
      EBAY_ENV === "sandbox"
        ? "https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search"
        : "https://api.ebay.com/buy/browse/v1/item_summary/search";

    const EBAY_API_TOKEN =
      EBAY_ENV === "sandbox"
        ? process.env.EBAY_SANDBOX_API_TOKEN
        : process.env.EBAY_PRODUCTION_API_TOKEN;

    console.log(`Fetching "${query}" from ${EBAY_ENV} eBay API (${limit} watches)`);

    const response = await axios.get(EBAY_API_URL, {
      params: {
        q: query,
        limit,
      },
      headers: {
        Authorization: `Bearer ${EBAY_API_TOKEN}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
    });

    if (!response.data.itemSummaries || response.data.itemSummaries.length === 0) {
      console.log("⚠️ No watches found for this query.");
      return [];
    }

    // Map and format the watches data from eBay.
    const formattedWatches = response.data.itemSummaries.map((item) => {
      const priceValue = item.price && !isNaN(item.price.value) ? parseFloat(item.price.value) : 0;
      
      let description = item.shortDescription || item.subtitle;
      if (!description) {
        description = `This ${item.title} is available for $${priceValue}. Sold by ${item.seller?.username || "a trusted eBay seller"}.`;
      }

      return {
        name: item.title?.trim() || null,
        price: priceValue > 0 ? priceValue : null,
        image: item.image?.imageUrl || null,
        // Use the enhanced extractBrand function by passing the admin-specified brand.
        category: extractBrand(item.title, brand).toLocaleLowerCase(),
        description,
        // Set a random inventory for demo purposes; adjust as needed.
        inventory: Math.floor(Math.random() * 10) + 1,
      };
    });

    // Filter out watches with missing required fields or with 'Unknown Brand'
    let validWatches = formattedWatches.filter(watch =>
      watch.category && watch.category !== 'Unknown Brand' &&
      watch.name && watch.price && watch.image
    );

    // If a brand filter is provided, further filter the watches based on the brand.
    if (brand && brand.trim() !== "") {
      validWatches = validWatches.filter(watch =>
        watch.category.toLowerCase().includes(brand.toLowerCase())
      );
    }

    console.log("🎉 Valid watches fetched:", JSON.stringify(validWatches, null, 2));
    return validWatches;
  } catch (error) {
    console.error("❌ Error fetching watches from eBay:", error.response?.data || error.message);
    return [];
  }
};

module.exports = fetchWatchesFromEbay;

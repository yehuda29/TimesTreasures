const axios = require("axios");
require("dotenv").config();

const fetchWatchesFromEbay = async (query = "wrist watch", category = "all", limit = 10) => {
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

    const categoryMap = {
      "men-watches": "31387",
      "women-watches": "31388",
      "luxury-watches": "179175",
      "smartwatches": "178893",
    };

    const ebayCategoryId = category !== "all" ? categoryMap[category] : undefined;

    const response = await axios.get(EBAY_API_URL, {
      params: {
        q: query,
        category_ids: ebayCategoryId,
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

    // Ensure all watches have valid data
    const formattedWatches = response.data.itemSummaries.map((item) => {
      const priceValue = item.price && !isNaN(item.price.value) ? parseFloat(item.price.value) : 0;
      
      let description = item.shortDescription || item.subtitle;
      if (!description) {
        description = `This ${item.title} is available for $${priceValue}.  
        Sold by ${item.seller?.username || "a trusted eBay seller"}.  `;
      }

      return {
        name: item.title?.trim() || null, // If null, it will be filtered out later
        price: priceValue > 0 ? priceValue : null, // If null, it will be filtered out later
        image: item.image?.imageUrl || null, // If null, it will be filtered out later
        category: category !== "all" ? category : "luxury-watches",
        description,
        inventory: Math.floor(Math.random() * 10) + 1,
      };
    });

    console.log("🎉 Fetched and Validated Watches:", JSON.stringify(formattedWatches, null, 2));
    return formattedWatches;
  } catch (error) {
    console.error("❌ Error fetching watches from eBay:", error.response?.data || error.message);
    return [];
  }
};

module.exports = fetchWatchesFromEbay;

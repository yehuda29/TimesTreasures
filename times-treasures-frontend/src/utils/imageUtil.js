// src/utils/imageUtil.js

function getImageURL(image) {
    // If the image string is already a URL (from Cloudinary), return it directly.
    if (image.startsWith('http')) {
      return image;
    }
    // Otherwise, assume it's a local asset filename.
    return new URL(`../assets/${image}`, import.meta.url).href;
  }
  
  export { getImageURL };
  
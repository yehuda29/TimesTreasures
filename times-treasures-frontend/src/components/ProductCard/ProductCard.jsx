// src/components/ProductCard/ProductCard.jsx

import React from 'react';
// Import Link to allow navigation to the product detail page when an element is clicked
import { Link } from 'react-router-dom';
// Import the CSS module for styling this component
import styles from './ProductCard.module.css';
import { getImageURL } from '../../utils/imageUtil';
// ProductCard is a presentational component that displays watch information in a card format.
// It accepts a "watch" object as a prop, which contains data such as _id, image, name, and price.
const ProductCard = ({ watch }) => {
  console.log(`URL: ${watch.image}`)
  return (
    <div className={styles.productCard}>
      {/* 
        The image is wrapped in a Link so that only the image area is clickable.
        Clicking on the image navigates the user to the detailed page for this watch.
      */}
      <Link to={`/product/${watch._id}`} className={styles.imageLink}>
        <img
          src = {getImageURL(watch.image)}  // The image URL of the watch
          alt = {watch.name}           // The watch name for accessibility
          className={styles.productImage}  // CSS class to style the image
          loading="lazy"             // Lazy loading for better performance
        />
      </Link>

      {/* Container for additional watch details */}
      <div className={styles.productDetails}>
        {/* Display the watch's name */}
        <h3 className={styles.productName}>{watch.name}</h3>
        {/* Display the watch's price, formatted to two decimals */}
        <p className={styles.productPrice}>${watch.price.toFixed(2)}</p>

        {/* 
          A separate Link is used for the "View Details" button.
          This allows the user to click on the button to navigate to the product detail page.
        */}
        <Link to={`/product/${watch._id}`} className={styles.viewDetailsBtn}>
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;

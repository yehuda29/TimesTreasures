// src/components/ProductCard/ProductCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import { getImageURL } from '../../utils/imageUtil';
import { calculateFinalPrice } from '../../utils/priceUtil';

const ProductCard = ({ watch }) => {
  const finalPrice = calculateFinalPrice(watch);
  const isDiscounted = finalPrice < Number(watch.price);

  return (
    <div className={styles.productCard}>
      <Link to={`/product/${watch._id}`} className={styles.imageLink}>
        <img
          src={getImageURL(watch.image)}
          alt={watch.name}
          className={styles.productImage}
          loading="lazy"
        />
      </Link>
      <div className={styles.productDetails}>
        <h3 className={styles.productName}>{watch.name}</h3>
        {isDiscounted ? (
          <div className={styles.priceContainer}>
            <p className={styles.originalPrice}>
            <s>₪{(Number(watch.price)).toFixed(2)}</s>
            </p>
            <span className={styles.arrow}>→</span>
            <p className={styles.discountedPrice}>
               ₪{(finalPrice).toFixed(2)} 
            </p>
          </div>
        ) : (
          <p className={styles.productPrice}>₪{(Number(watch.price)).toFixed(2)}</p>
        )}
        <Link to={`/product/${watch._id}`} className={styles.viewDetailsBtn}>
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;

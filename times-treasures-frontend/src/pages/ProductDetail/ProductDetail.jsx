// src/pages/ProductDetail/ProductDetail.jsx

import React, { useContext, useState, useEffect } from 'react';
// useParams is used to extract the watch ID from the URL parameters
import { useParams } from 'react-router-dom';
// Import CSS module for styling the product detail page
import styles from './ProductDetail.module.css';
// Axios is used to make HTTP requests to the backend API
import axios from 'axios';
// Import CartContext to access the addToCart function for adding items to the shopping cart
import { CartContext } from '../../context/CartContext';
// Import toast for displaying notifications to the user
import { toast } from 'react-toastify'; 

const ProductDetail = () => {
  // Extract the watch ID from the URL using useParams
  const { id } = useParams(); 

  // State to store the fetched watch data; initially null
  const [watch, setWatch] = useState(null);
  // Loading state to indicate if the watch data is being fetched
  const [loading, setLoading] = useState(true);
  // Error state to track any issues during the fetch process
  const [error, setError] = useState(false);

  // Retrieve the addToCart function from CartContext so we can add the watch to the cart
  const { addToCart } = useContext(CartContext); 

  // State to manage the quantity of the watch the user wishes to add to the cart
  const [quantity, setQuantity] = useState(1);

  // useEffect to fetch the watch data when the component mounts or when the 'id' changes
  useEffect(() => {
    const fetchWatch = async () => {
      try {
        // Make an HTTP GET request to fetch the watch details using its ID.
        // The API is expected to return data in the format: { success, data: { ... } }
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/watches/${id}`
        );

        // Extract the watch object from the response
        const fetchedWatch = response.data.data;

        // Validate that the fetched data is an object; if not, throw an error
        if (!fetchedWatch || typeof fetchedWatch !== 'object') {
          throw new Error('Invalid watch data');
        }

        // Save the fetched watch data to the state
        setWatch(fetchedWatch);
      } catch (err) {
        // Log the error and update the error state if something goes wrong
        console.error(err);
        setError(true);
      } finally {
        // Once the fetch is complete (whether successful or not), set loading to false
        setLoading(false);
      }
    };

    fetchWatch();
  }, [id]);

  // Function to handle adding the watch to the cart
  const handleAddToCart = () => {
    if (watch) {
      // Ensure quantity is at least 1
      const validQuantity = quantity < 1 ? 1 : quantity;
      // Call the addToCart function from the context with the watch's details and the selected quantity.
      // Here, we pass the necessary fields as a single object.
      addToCart({
        _id: watch._id,
        name: watch.name,
        price: watch.price,
        image: watch.image,
        quantity: validQuantity
      });
      // Show a success notification to the user
      toast.success(`${watch.name} (x${validQuantity}) added to your cart!`);
    }
  };

  // If data is still loading, display a loading message
  if (loading) return <p className={styles.loader}>Loading...</p>;

  // If an error occurred or no watch was found, display an error message
  if (error || !watch) {
    return (
      <div className={styles.productDetail}>
        <h2>Watch Not Found</h2>
        <p>The watch you are looking for does not exist.</p>
      </div>
    );
  }

  // Render the product details once the watch data has been successfully fetched
  return (
    <div className={styles.productDetail}>
      {/* Display the watch image */}
      <img src={watch.image} alt={watch.name} className={styles.productImage} />
      <div className={styles.productInfo}>
        {/* Display the watch name */}
        <h2 className={styles.productName}>{watch.name}</h2>
        {/* Display the watch price, formatted to two decimal places */}
        <p className={styles.productPrice}>${watch.price.toFixed(2)}</p>
        {/* Display the watch description */}
        <p className={styles.productDescription}>{watch.description}</p>

        {/* Quantity Selector: allows the user to choose how many of the watch to add */}
        <div className={styles.quantitySelector}>
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            max="100"
            value={quantity}
            // Update the quantity state when the input value changes
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
          />
        </div>

        {/* Button to add the watch to the shopping cart */}
        <button className={styles.addToCartBtn} onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;

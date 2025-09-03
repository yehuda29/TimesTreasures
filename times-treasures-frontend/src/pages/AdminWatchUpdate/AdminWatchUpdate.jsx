import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './AdminWatchUpdate.module.css';
import { AuthContext } from '../../context/AuthContext';
import { calculateFinalPrice } from '../../utils/priceUtil';

const AdminWatchUpdate = () => {
  const { id } = useParams(); // Watch ID from URL
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  // Redirect non-admin users
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error("Access denied");
      navigate('/');
    }
  }, [user, navigate]);

  // State variables for watch details and update fields
  const [watch, setWatch] = useState(null);
  const [stock, setStock] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [offerStart, setOfferStart] = useState('');
  const [offerEnd, setOfferEnd] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch watch details when component mounts
  useEffect(() => {
    const fetchWatch = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches/${id}`);
        const fetchedWatch = response.data.data;
        setWatch(fetchedWatch);
        setStock(fetchedWatch.inventory);
        setDiscountPercentage(fetchedWatch.specialOffer?.discountPercentage || 0);
        setOfferStart(
          fetchedWatch.specialOffer?.offerStart
            ? new Date(fetchedWatch.specialOffer.offerStart).toISOString().substr(0, 10)
            : ''
        );
        setOfferEnd(
          fetchedWatch.specialOffer?.offerEnd
            ? new Date(fetchedWatch.specialOffer.offerEnd).toISOString().substr(0, 10)
            : ''
        );
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch watch details");
      } finally {
        setLoading(false);
      }
    };
    fetchWatch();
  }, [id]);

  // Handler for submitting updates with validation for special offer dates
  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validate that if a discount is applied (non-zero), both offer start and end dates are provided.
    if (Number(discountPercentage) !== 0 && (!offerStart || !offerEnd)) {
      toast.error("Please specify both offer start and end dates when applying a discount.");
      return;
    }

    // Validate that offer end date is later than offer start date.
    if (Number(discountPercentage) !== 0 && new Date(offerEnd) <= new Date(offerStart)) {
      toast.error("Offer end date must be later than offer start date.");
      return;
    }

    try {
      const updatedData = {
        inventory: Number(stock),
        specialOffer: {
          discountPercentage: Number(discountPercentage),
          offerStart: offerStart ? new Date(offerStart) : null,
          offerEnd: offerEnd ? new Date(offerEnd) : null
        }
      };
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/watches/${id}`, updatedData, config);
      setWatch(response.data.data);
      toast.success("Watch updated successfully");
      navigate(`/product/${id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update watch");
    }
  };

  if (loading) return <p>Loading watch details...</p>;

  return (
    <div className={styles.adminWatchUpdate}>
      <h2>Update Watch Details</h2>
      
      {watch && (
        <>
          {/* Price Display Section */}
          <div className={styles.priceDisplay}>
            <h3>Price</h3>
            {(() => {
              const finalPrice = calculateFinalPrice(watch);
              const isDiscounted = finalPrice < Number(watch.price);
              if (isDiscounted) {
                return (
                  <div className={styles.priceContainer}>
                    <p className={styles.originalPrice}>
                      <s>${Number(watch.price).toFixed(2)}</s>
                    </p>
                    <span className={styles.arrow}>→</span>
                    <p className={styles.discountedPrice}>
                      ${finalPrice.toFixed(2)}
                    </p>
                  </div>
                );
              } else {
                return (
                  <p className={styles.productPrice}>
                    ${Number(watch.price).toFixed(2)}
                  </p>
                );
              }
            })()}
          </div>

          <form onSubmit={handleUpdate} className={styles.updateForm}>
            <div className={styles.formGroup}>
              <label htmlFor="stock">Stock:</label>
              <input
                type="number"
                id="stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="discountPercentage">Discount Percentage:</label>
              <input
                type="number"
                id="discountPercentage"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="offerStart">Offer Start Date:</label>
              <input
                type="date"
                id="offerStart"
                value={offerStart}
                onChange={(e) => setOfferStart(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="offerEnd">Offer End Date:</label>
              <input
                type="date"
                id="offerEnd"
                value={offerEnd}
                onChange={(e) => setOfferEnd(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.updateBtn}>Update Watch</button>
          </form>
        </>
      )}
    </div>
  );
};

export default AdminWatchUpdate;

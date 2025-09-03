// src/pages/Contact/Contact.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './Contact.module.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  // Update the formData state whenever a field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send POST request to your backend endpoint for contact
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/contact`,
        formData
      );

      // If successful, clear the form and show a toast
      if (response.data.success) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        toast.error(response.data.message || 'Failed to send message.');
      }
    } catch (error) {
      toast.error('An error occurred while sending your message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.contactContainer}>
      <h1>Contact Us</h1>
      <p>
        Have questions, feedback, or just want to say hello? 
        Send us a message below. We’d love to hear from you!
      </p>

      <form onSubmit={handleSubmit} className={styles.contactForm}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default Contact;

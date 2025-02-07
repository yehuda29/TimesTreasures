// src/pages/Contact/Contact.jsx

import React, { useState } from 'react';
import styles from './Contact.module.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can handle form submission, e.g., send data to a backend
    console.log(formData);
    setSubmitted(true);
    // Reset form
    setFormData({
      name: '',
      email: '',
      message: '',
    });
  };

  return (
    <div className={styles.contact}>
      <h2 className={styles.title}>Contact Us</h2>
      
      <div className={styles.contactContainer}>
        {/* Contact Information */}
        <div className={styles.contactInfo}>
          <h3>Get in Touch</h3>
          <p><strong>Address:</strong> 1234 Watch St., City, State, ZIP</p>
          <p><strong>Email:</strong> info@watchshop.com</p>
          <p><strong>Phone:</strong> (123) 456-7890</p>
          
          {/* Optional: Embed Google Map */}
          <iframe
            title="Store Location"
            src="https://www.google.com/maps/embed?pb=!1m18!..." // Replace with your store's embed link
            width="100%"
            height="200"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className={styles.map}
          ></iframe>
        </div>
        
        {/* Contact Form */}
        <div className={styles.contactForm}>
          <h3>Send Us a Message</h3>
          {submitted ? (
            <p className={styles.thankYou}>Thank you for contacting us!</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Name:</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required 
              />

              <label htmlFor="email">Email:</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />

              <label htmlFor="message">Message:</label>
              <textarea 
                id="message" 
                name="message" 
                value={formData.message}
                onChange={handleChange}
                required 
              ></textarea>

              <button type="submit" className={styles.submitBtn}>Submit</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;

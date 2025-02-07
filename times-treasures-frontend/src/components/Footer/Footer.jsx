// src/components/Footer/Footer.js

import React from 'react';
import styles from './Footer.module.css';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        {/* Navigation Section */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Navigation</h3>
          <ul className={styles.linkList}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>

        {/* Information Section */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Information</h3>
          <ul className={styles.linkList}>
            <li>Time's Treasures</li>
            <li>1234 Watch St.</li>
            <li>City, State, ZIP</li>
            <li>Email: info@watchshop.com</li>
            <li>Phone: (123) 456-7890</li> {/* Filled in phone number */}
          </ul>
          <div className={styles.socialMedia}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
          </div>
        </div>

        {/* Legal Section */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Legal</h3>
          <ul className={styles.linkList}>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/return">Return Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Watch Shop. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

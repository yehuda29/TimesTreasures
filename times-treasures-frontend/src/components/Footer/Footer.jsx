// src/components/Footer/Footer.js
import React, { useState, useEffect } from 'react';
import styles from './Footer.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/branches`);
        if (response.data.success) {
          setBranches(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching branches for footer:", error);
      }
    };

    fetchBranches();
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        {/* Navigation Section */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Navigation</h3>
          <ul className={styles.linkList}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Information Section now only contains branch links */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Information</h3>
          <ul className={styles.linkList}>
            {branches.map((branch) => (
              <li key={branch._id}>
                <Link to={`/display-branch/${encodeURIComponent(branch.name)}`}>
                  {branch.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Time's Treasures. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

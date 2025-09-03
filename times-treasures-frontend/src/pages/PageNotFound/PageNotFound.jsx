// src/pages/PageNotFound/PageNotFound.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PageNotFound.module.css';

const PageNotFound = () => {
  return (
    <div className={styles.pageNotFound}>
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className={styles.homeLink}>Go to Home</Link>
    </div>
  );
};

export default PageNotFound;

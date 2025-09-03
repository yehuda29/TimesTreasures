// src/components/HeroSection/HeroSection.js

import React from "react";
import styles from "./HeroSection.module.css";
import Carousel from "../Carousel/Carousel";
import w1 from "../../assets/HW_Full1.webp";
import w2 from "../../assets/HW_Full2.webp";
import w3 from "../../assets/HW_Full3.webp";
import w4 from "../../assets/HW_Full4.webp";

// Example watch images array
const watchImages = [
  { url: w1, alt: "Watch 1" },
  { url: w2, alt: "Watch 2" },
  { url: w3, alt: "Watch 3" },
  { url: w4, alt: "Watch 4" },
];

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      {/* Carousel behind the text */}
      <Carousel watchImages={watchImages} />

      {/* Optional overlay for darkening images */}
      <div className={styles.heroOverlay}></div>

      {/* Centered text content */}
      <div className={styles.heroContent}>
        <h1 className={styles.title}>Discover the Finest Watches</h1>
        <p className={styles.subtitle}>
          The Treasures of Time are Ready For You!
        </p>
      </div>
    </section>
  );
};

export default HeroSection;

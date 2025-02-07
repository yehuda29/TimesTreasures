import React, { useEffect, useState } from "react";
import styles from "./Carousel.module.css";

const Carousel = ({ watchImages }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);

  useEffect(() => {
    // Switch slides every 10 seconds
    const interval = setInterval(() => {

      setPrevSlide(currentSlide);

      // Move to next slide
      setCurrentSlide((prev) => (prev + 1) % watchImages.length);

    }, 10000);

    return () => clearInterval(interval);
  }, [currentSlide, watchImages.length]);

  return (
    <div className={styles.carousel}>
      {watchImages.map((img, index) => {
        // Old slide
        if (index === prevSlide) {
          return (
            <div
              key={`old-${index}`}
              className={`${styles.slide} ${styles.oldSlide}`}
              style={{ backgroundImage: `url(${img.url})` }}
            />
          );
        }
        // Active slide
        if (index === currentSlide) {
          return (
            <div
              key={`active-${index}`}
              className={`${styles.slide} ${styles.activeSlide}`}
              style={{ backgroundImage: `url(${img.url})` }}
            />
          );
        }
        // Hidden slides
        return (
          <div
            key={`hidden-${index}`}
            className={styles.slide}
            style={{ opacity: 0 }}
          />
        );
      })}
    </div>
  );
};

export default Carousel;

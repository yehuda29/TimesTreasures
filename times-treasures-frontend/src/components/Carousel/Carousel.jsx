import React, { useEffect, useState } from "react";
import styles from "./Carousel.module.css";

const Carousel = ({ watchImages }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevSlide(currentSlide);
      setCurrentSlide((prev) => (prev + 1) % watchImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentSlide, watchImages.length]);

  const handlePrev = () => {
    setPrevSlide(currentSlide);
    setCurrentSlide(
      (currentSlide - 1 + watchImages.length) % watchImages.length
    );
  };

  const handleNext = () => {
    setPrevSlide(currentSlide);
    setCurrentSlide((currentSlide + 1) % watchImages.length);
  };

  return (
    <div className={styles.carousel}>
      {watchImages.map((img, index) => {
        if (index === prevSlide) {
          return (
            <div
              key={`old-${index}`}
              className={`${styles.slide} ${styles.oldSlide}`}
              style={{ backgroundImage: `url(${img.url})` }}
            />
          );
        }
        if (index === currentSlide) {
          return (
            <div
              key={`active-${index}`}
              className={`${styles.slide} ${styles.activeSlide}`}
              style={{ backgroundImage: `url(${img.url})` }}
            />
          );
        }
        return (
          <div
            key={`hidden-${index}`}
            className={styles.slide}
            style={{ opacity: 0 }}
          />
        );
      })}
      <button className={styles.prevButton} onClick={handlePrev}>
        ‹
      </button>
      <button className={styles.nextButton} onClick={handleNext}>
        ›
      </button>
    </div>
  );
};

export default Carousel;

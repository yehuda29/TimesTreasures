// src/components/Navbar/Navbar.jsx

import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Access totalItems from CartContext
  const { totalItems } = useContext(CartContext);
  // Access user and logout from AuthContext
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownVisible(false);
  };

  const handleDropdownEnter = () => {
    setIsDropdownVisible(true);
  };

  const handleDropdownLeave = () => {
    setIsDropdownVisible(false);
  };

  const handleLogout = () => {
    logout();
    toast.info("You have been logged out.");
    closeMenus();
    navigate("/");
  };

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <div className={styles.navbarLogo}>
        <Link to="/" onClick={closeMenus}>
          Time's Treasures
        </Link>
      </div>

      {/* Search Bar */}
      <div className={styles.navbarSearch}>
        <input type="text" placeholder="Search..." aria-label="Search" />
        <button className={styles.searchBtn}>
          <FaSearch />
        </button>
      </div>

      {/* Hamburger Icon for Mobile */}
      <div
        className={styles.navbarHamburger}
        onClick={toggleMobileMenu}
        aria-label="Toggle navigation menu"
      >
        <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ""}`}></span>
        <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ""}`}></span>
        <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ""}`}></span>
      </div>

      {/* Navigation Links (Desktop & Mobile) */}
      <ul className={`${styles.navbarLinks} ${isMobileMenuOpen ? styles.open : ""}`}>
        <li className={currentPath === "/" ? styles.active : ""}>
          <Link to="/" onClick={closeMenus}>
            Home
          </Link>
        </li>
        <li
          className={styles.dropdown}
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleDropdownLeave}
        >
          <Link to="/shop" onClick={(e) => e.preventDefault()}>
            Shop
          </Link>
          {isDropdownVisible && (
            <ul className={styles.dropdownMenu}>
              <li>
                <Link to="/men-watches" onClick={closeMenus}>
                  Men's Watches
                </Link>
              </li>
              <li>
                <Link to="/women-watches" onClick={closeMenus}>
                  Women's Watches
                </Link>
              </li>
              <li>
                <Link to="/luxury-watches" onClick={closeMenus}>
                  Luxury Watches
                </Link>
              </li>
              <li>
                <Link to="/smartwatches" onClick={closeMenus}>
                  Smart Watches
                </Link>
              </li>
            </ul>
          )}
        </li>
        {/* Only show the Cart link if a user is logged in */}
        {user && (
          <li className={currentPath === "/cart" ? styles.active : ""}>
            <Link to="/cart" onClick={closeMenus} className={styles.cartLink}>
              <FaShoppingCart className={styles.cartIcon} />
              <span className={styles.cartCount}>({totalItems})</span>
            </Link>
          </li>
        )}
        <li className={currentPath === "/contact" ? styles.active : ""}>
          <Link to="/contact" onClick={closeMenus}>
            Contact
          </Link>
        </li>
        {user && (
          <li className={currentPath === "/profile" ? styles.active : ""}>
            <Link to="/profile" onClick={closeMenus}>
              Profile
            </Link>
          </li>
        )}
        {user && user.role === "admin" && (
          <li className={currentPath === "/admin" ? styles.active : ""}>
            <Link to="/admin" onClick={closeMenus}>
              Admin
            </Link>
          </li>
        )}
        {/* If no user is logged in, show Login & Sign Up */}
        {!user && (
          <>
            <li>
              <Link to="/login">
                <button className={styles.navbarBtn} onClick={closeMenus}>
                  Login
                </button>
              </Link>
            </li>
            <li>
              <Link to="/register">
                <button className={`${styles.navbarBtn} ${styles.primary}`} onClick={closeMenus}>
                  Sign Up
                </button>
              </Link>
            </li>
          </>
        )}
        {/* If user is logged in, show welcome text and Logout */}
        {user && (
          <>
            <li className={styles.welcomeText}>
              Welcome {user.name}!
            </li>
            <li>
              <button className={styles.navbarBtn} onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

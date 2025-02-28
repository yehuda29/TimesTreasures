// src/components/Navbar/Navbar.jsx

import React, { useState, useEffect, useContext } from "react";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios to make HTTP requests
import styles from "./Navbar.module.css";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import NotificationBell from "../NotificationBell/NotificationBell";
import { toast } from "react-toastify";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [brands, setBrands] = useState([]); // New state to hold dynamic brands

  // Access totalItems from CartContext
  const { totalItems } = useContext(CartContext);
  // Access user and logout from AuthContext
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Update currentPath on history changes
  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // NEW: Fetch unique watch brands from the backend when Navbar mounts
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // Assumes your backend exposes an endpoint that returns distinct brands
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/watches/brands`);
        if (response.data && response.data.success) {
          // response.data.data should be an array of brand names (e.g., ["Rolex", "Apple", ...])
          setBrands(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchBrands();
  }, []);

  // Toggles for mobile menu and dropdown visibility
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

      {/* Navigation Links */}
      <ul className={`${styles.navbarLinks} ${isMobileMenuOpen ? styles.open : ""}`}>
        <li className={currentPath === "/" ? styles.active : ""}>
          <Link to="/" onClick={closeMenus}>
            Home
          </Link>
        </li>
        {/* Shop Dropdown using dynamic brands */}
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
              {brands.length > 0 ? (
                brands.map((brand) => (
                  <li key={brand}>
                    {/* 
                      Link to a route that filters watches by brand.
                      You may need to set up a corresponding route (e.g., /shop/:brand) 
                      and adjust filtering logic in your watch fetching code.
                    */}
                    <Link to={`/shop/${brand.toLowerCase()}`} onClick={closeMenus}>
                      {brand}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <span>No brands available</span>
                </li>
              )}
            </ul>
          )}
        </li>
        {/* Cart Link (only shown if user is logged in) */}
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
        {/* Authentication Links */}
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
        {user && user.role === "admin" && <NotificationBell />}
      </ul>
    </nav>
  );
};

export default Navbar;

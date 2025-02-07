// src/App.jsx

import React, { Suspense, lazy } from 'react';
// Import BrowserRouter (aliased as Router), Routes, and Route from react-router-dom for client-side routing
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import Navbar and Footer components for the global layout
import Navbar from "./components/NavBar/Navbar.jsx";
import Footer from "./components/Footer/Footer.jsx";
// Import ToastContainer for showing notifications, along with its CSS
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Import CartProvider to manage the global cart state
import { CartProvider } from './context/CartContext';
// Import ErrorBoundary to catch and display errors from the component tree
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
// Import LocationListener to log route changes (useful for debugging)
import LocationListener from './components/LocationListener/LocationListener.jsx';
// Import AuthProvider to manage authentication state and provide auth functions
import { AuthProvider } from './context/AuthContext.jsx';

// Lazy load pages for code-splitting and improved performance
const Home = lazy(() => import('./pages/Home/Home.jsx'));
const MenWatches = lazy(() => import('./pages/MenWatches/MenWatches.jsx'));
const WomenWatches = lazy(() => import('./pages/WomenWatches/WomenWatches.jsx'));
const LuxuryWatches = lazy(() => import('./pages/LuxuryWatches/LuxuryWatches.jsx'));
const SmartWatches = lazy(() => import('./pages/SmartWatches/SmartWatches.jsx'));
const Contact = lazy(() => import('./pages/Contact/Contact.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart/Cart.jsx'));
const Login = lazy(() => import('./pages/Login/Login.jsx'));
const Register = lazy(() => import('./pages/Register/Register.jsx'));
const PurchaseHistory = lazy(() => import('./pages/PurchaseHistory/PurchaseHistory.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard/AdminDashboard.jsx'));

// The main App component sets up the global context providers and routing for the application.
const App = () => {
  return (
    // Wrap the entire application with CartProvider so that cart data is globally available.
    <CartProvider>
      {/* Wrap the application with AuthProvider so authentication data is available. */}
      <AuthProvider>
        {/* Set up the Router to manage client-side routing */}
        <Router>
          {/* Wrap all routes with an ErrorBoundary to catch and display errors gracefully */}
          <ErrorBoundary>
            {/* LocationListener logs every route change (useful for debugging) */}
            <LocationListener />
            <div className="App">
              {/* Render the Navbar at the top, which is visible on all pages */}
              <Navbar />
              {/* The main content area where different pages will be rendered */}
              <div className="content">
                {/* Use Suspense to show a fallback UI ("Loading...") while lazy-loaded components are fetched */}
                <Suspense fallback={<div>Loading...</div>}>
                  {/* Define application routes */}
                  <Routes>
                    {/* Home route */}
                    <Route path="/" element={<Home />} />
                    {/* Shop categories */}
                    <Route path="/men-watches" element={<MenWatches />} />
                    <Route path="/women-watches" element={<WomenWatches />} />
                    <Route path="/luxury-watches" element={<LuxuryWatches />} />
                    <Route path="/smartwatches" element={<SmartWatches />} />
                    {/* Other pages */}
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    {/* Authentication routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    {/* User-specific pages */}
                    <Route path="/purchase-history" element={<PurchaseHistory />} />
                    {/* Admin-specific route */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    {/* Fallback route for unmatched paths */}
                    <Route
                      path="*"
                      element={
                        <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>
                          Page Not Found
                        </h2>
                      }
                    />
                  </Routes>
                </Suspense>
              </div>
              {/* ToastContainer displays notifications; positioned at the top-right */}
              <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
              {/* Render the Footer at the bottom */}
              <Footer />
            </div>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </CartProvider>
  );
};

export default App;

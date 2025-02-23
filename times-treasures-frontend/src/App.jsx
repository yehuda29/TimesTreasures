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
// Import AuthProvider to manage authentication state and provide auth functions
import { AuthProvider } from './context/AuthContext.jsx';
// Import CartProvider to manage the global persistent cart state
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import LocationListener from './components/LocationListener/LocationListener.jsx';

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
const Profile = lazy(() => import('./pages/Profile/Profile.jsx'));
const SetAddress = lazy(() => import('./pages/SetAddress/SetAddress.jsx'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout.jsx'));

const App = () => {
  return (
    // Wrap with AuthProvider first so authentication data is available
    <AuthProvider>
      {/* Now wrap with CartProvider so that it can re-fetch the cart based on the authenticated user */}
      <CartProvider>
        <Router>
          <ErrorBoundary>
            <LocationListener />
            <div className="App">
              <Navbar />
              <div className="content">
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/men-watches" element={<MenWatches />} />
                    <Route path="/women-watches" element={<WomenWatches />} />
                    <Route path="/luxury-watches" element={<LuxuryWatches />} />
                    <Route path="/smartwatches" element={<SmartWatches />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/purchase-history" element={<PurchaseHistory />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/address" element={<SetAddress />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="*" element={<h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Page Not Found</h2>} />
                  </Routes>
                </Suspense>
              </div>
              <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
              <Footer />
            </div>
          </ErrorBoundary>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;

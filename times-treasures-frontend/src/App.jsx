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
const CategoryWatches = lazy(() => import("./pages/CategoryWatches/CategoryWatches.jsx"));
const AdminWatchUpdate = lazy(() => import('./pages/AdminWatchUpdate/AdminWatchUpdate.jsx'));
const DiscountedWatches = lazy(() => import('./pages/DiscountedWatches/DiscountedWatches.jsx'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics/AdminAnalytics.jsx'));
const OrderTracking = lazy(() => import('./pages/OrderTracking/OrderTracking.jsx'));
const SearchResults = lazy(() => import('./pages/SearchResults/SearchResults.jsx'));
const UpdatePersonalInformation = lazy(() => import('./pages/UpdatePersonalInformation/UpdatePersonalInformation.jsx'));
const BranchCreation = lazy(() => import('./pages/BranchCreation/BranchCreation.jsx'));
const DisplayBranch = lazy(() => import('./pages/DisplayBranch/DisplayBranch.jsx'));
const Shop = lazy(() => import('./pages/Shop/Shop.jsx'));
const AdminUsersTable = lazy(() => import('./pages/AdminUsersTable/AdminUsersTable.jsx'));


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
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/purchase-history" element={<PurchaseHistory />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/address" element={<SetAddress />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/shop/:category" element={<CategoryWatches />} />
                    <Route path="/admin/watch-update/:id" element={<AdminWatchUpdate />} />
                    <Route path="/discounted-watches" element={<DiscountedWatches />} />
                    <Route path="/order-tracking" element={<OrderTracking />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/update-personal-info" element={<UpdatePersonalInformation />} />
                    <Route path="/display-branch/:branchName" element={<DisplayBranch />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />
                    <Route path="/admin/branch-creation" element={<BranchCreation />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/users/table" element={<AdminUsersTable />} />
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

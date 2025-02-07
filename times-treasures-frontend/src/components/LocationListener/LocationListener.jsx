// src/components/LocationListener/LocationListener.jsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// The LocationListener component listens for changes in the URL location.
const LocationListener = () => {
  // useLocation returns the current location object, which includes the pathname.
  const location = useLocation();

  // useEffect runs whenever the location object changes.
  useEffect(() => {
    // Log the new pathname to the console whenever navigation occurs.
    console.log('Navigated to:', location.pathname);
  }, [location]); // Dependency on location ensures the effect runs on each route change.

  // This component doesn't render any UI, so it returns null.
  return null;
};

export default LocationListener;

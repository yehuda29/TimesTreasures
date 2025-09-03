// src/pages/DisplayBranch/DisplayBranch.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styles from './DisplayBranch.module.css';

// Fix default marker icons for React environments
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DisplayBranch = () => {
  const { branchName } = useParams();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/branches`);
        if (response.data.success) {
          // Decode the branchName from the URL and search for a matching branch
          const decodedName = decodeURIComponent(branchName);
          const found = response.data.data.find(b => b.name === decodedName);
          setBranch(found);
        }
      } catch (error) {
        console.error("Error fetching branch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranch();
  }, [branchName]);

  if (loading) return <p>Loading branch information...</p>;
  if (!branch) return <p>Branch not found.</p>;

  // Convert branch.position to an array for react-leaflet
  const branchPosition = [branch.position.lat, branch.position.lng];

  return (
    <div className={styles.displayBranchContainer}>
      <h1>{branch.name}</h1>
      <div className={styles.branchDetails}>
        {branch.address && <p><strong>Address:</strong> {branch.address}</p>}
        <p><strong>Phone:</strong> {branch.phoneNumber}</p>
        <p><strong>Hours:</strong> {branch.openingHour} - {branch.closingHour}</p>
      </div>
      <div className={styles.mapContainer}>
        <MapContainer center={branchPosition} zoom={15} style={{ height: '300px', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={branchPosition}>
            <Popup>
              {branch.name} <br /> {branch.address}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default DisplayBranch;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import styles from './ShowBranchesMap.module.css';

// Fix default marker icons for React environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ShowBranchesMap = () => {
  // Default center set to Tel Aviv coordinates
  const defaultPosition = [32.0853, 34.7818];

  // State for branch filtering and fetched branches
  const [filter, setFilter] = useState('');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch branches from the server
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/branches`);
        if (response.data && response.data.success) {
          setBranches(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError('Failed to load branches.');
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  // Filter branches based on the filter input (by name or address)
  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(filter.toLowerCase()) ||
    (branch.address && branch.address.toLowerCase().includes(filter.toLowerCase()))
  );

  if (loading) {
    return <p>Loading branches...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.mapWrapper}>
      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filter branches..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.filterInput}
        />
      </div>
      <div className={styles.mapContainer}>
        <MapContainer center={defaultPosition} zoom={12} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredBranches.map(branch => {
            // Use branch position if available, otherwise fall back to default (Tel Aviv)
            const branchPosition = branch.position
              ? [branch.position.lat, branch.position.lng]
              : defaultPosition;
            return (
              <Marker key={branch._id} position={branchPosition}>
                <Popup>
                  <div>
                    <h3>{branch.name}</h3>
                    {branch.address && <p>{branch.address}</p>}
                    {branch.phoneNumber && <p>Phone: {branch.phoneNumber}</p>}
                    {(branch.openingHour || branch.closingHour) && (
                      <p>
                        Hours: {branch.openingHour || 'N/A'} - {branch.closingHour || 'N/A'}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default ShowBranchesMap;

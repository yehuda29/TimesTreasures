import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Import marker images using ES module syntax
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ShowBranchesMap = () => {
  const [branches, setBranches] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/branches`);
        if (response.data && response.data.success) {
          setBranches(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  // Filter branches based on the search query (case-insensitive)
  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Use filteredBranches if searchQuery exists; otherwise, use the full list
  const displayBranches = searchQuery.trim() ? filteredBranches : branches;

  // Set default center to the first branch in the display list, or fallback to a preset coordinate
  const defaultCenter = displayBranches.length > 0
    ? [displayBranches[0].position.lat, displayBranches[0].position.lng]
    : [40.7549, -73.9840];

  return (
    <div>
      {/* Search Input */}
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Search for branch..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '0.5rem',
            width: '80%',
            maxWidth: '400px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
      </div>

      {/* Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {displayBranches.map((branch, index) => {
          const branchPosition = [branch.position.lat, branch.position.lng];
          return (
            <Marker key={index} position={branchPosition}>
              <Popup>
                <strong>{branch.name}</strong>
                {branch.address && (
                  <>
                    <br />
                    {branch.address}
                  </>
                )}
                <br />
                Phone: {branch.phoneNumber}
                <br />
                Hours: {branch.openingHour} - {branch.closingHour}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ShowBranchesMap;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Material UI components for layout and styling
import { Typography, Grid, CircularProgress, Paper } from '@mui/material';
// Recharts components for the charts, including ResponsiveContainer for responsiveness
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
// Import custom CSS module for additional styling
import styles from './AdminAnalytics.module.css';

// Custom label function for the PieChart: shows percentage value within each slice
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      style={{ fontSize: '12px', fontWeight: 'bold' }}
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

const AdminAnalytics = () => {
  // State to handle loading, error and data from the backend
  const [loading, setLoading] = useState(true);
  const [topSellingWatches, setTopSellingWatches] = useState([]);
  const [brandSales, setBrandSales] = useState([]);
  const [error, setError] = useState(null);

  // Function to fetch analytics from the backend admin endpoint
  const fetchSalesStats = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve admin token
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/sales-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Set data into state variables
      setTopSellingWatches(response.data.topSellingWatches);
      setBrandSales(response.data.brandSales);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch sales stats");
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchSalesStats();
  }, []);

  // Define colors for the PieChart slices
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFB', '#FF6666'];

  // Show loader if still fetching data
  if (loading) {
    return (
      <div className={styles.centered}>
        <CircularProgress />
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className={styles.centered}>
        <Typography variant="h6" color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <div className={styles.analyticsContainer}>
      <Typography variant="h4" gutterBottom>
        Sales Analytics
      </Typography>
      <Grid container spacing={4}>
        {/* Bar Chart for Top Selling Watches */}
        <Grid item xs={12} md={6}>
          <Paper className={styles.chartPaper}>
            <Typography variant="h6" className={styles.chartTitle}>
              Top Selling Watches
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topSellingWatches}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                {/* Define linear gradient for a fancier bar effect */}
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#f5f5f5', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="totalSold" fill="url(#colorBar)" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pie Chart for Sales by Brand */}
        <Grid item xs={12} md={6}>
          <Paper className={styles.chartPaper}>
            <Typography variant="h6" className={styles.chartTitle}>
              Sales by Brand
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={brandSales}
                  dataKey="totalSold"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#82ca9d"
                  label={renderCustomizedLabel}
                >
                  {brandSales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#f5f5f5', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default AdminAnalytics;

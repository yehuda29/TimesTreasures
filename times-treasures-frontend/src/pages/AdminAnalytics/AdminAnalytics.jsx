import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import styles from './AdminAnalytics.module.css';

// Custom tooltip for the Top Selling Watches BarChart
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
          padding: 10,
          maxWidth: '300px',
          wordWrap: 'break-word'
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        <p style={{ margin: 0, color: '#36a2eb' }}>{`Total Sold: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const CustomCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff, #e0f7fa)',
  boxShadow: '0px 6px 12px rgba(0,0,0,0.1)',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  marginBottom: theme.spacing(4)
}));

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [topSelling, setTopSelling] = useState([]);
  const [brandSales, setBrandSales] = useState([]);
  const [sexSales, setSexSales] = useState([]);
  const [error, setError] = useState(null);

  const fetchSalesStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/sales-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopSelling(res.data.topSellingWatches);
      setBrandSales(res.data.brandSales);
      setSexSales(res.data.sexSales);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch analytics data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesStats();
  }, []);

  const PIE_COLORS = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'];

  // Format the data for sexSales, capitalizing the sex label
  const formattedSexSales = sexSales.map(item => ({
    sex: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown',
    totalSold: item.totalSold
  }));

  if (loading) {
    return (
      <Container className={styles.root}>
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={styles.root}>
        <Typography variant="h6" color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className={styles.root}>
      <Box my={4}>
        <Typography variant="h3" align="center" gutterBottom sx={{ color: 'black' }}>
          Sales Analytics Dashboard
        </Typography>
      </Box>
      <Grid container spacing={4}>
        {/* Top Selling Watches Card */}
        <Grid item xs={12} md={6}>
          <CustomCard>
            <CardHeader title="Top Selling Watches" />
            <CardContent>
              <ResponsiveContainer
                width="100%"
                height={300}
                style={{ background: 'linear-gradient(135deg, #ffffff, #e0f7fa)' }}
              >
                <BarChart
                  data={topSelling}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, angle: -30, textAnchor: 'end' }}
                    tickMargin={20}
                    label={{
                      value: 'Watch Model',
                      position: 'insideBottom',
                      offset: -10,
                      style: { fontSize: 14, fontWeight: 'bold' }
                    }}
                  />
                  <YAxis
                    label={{
                      value: 'Units Sold',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 14, fontWeight: 'bold' }
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend verticalAlign="bottom" align="left" wrapperStyle={{ fontSize: '12px', marginTop: 10 }} />
                  <Bar dataKey="totalSold" name="Total Sold" fill="#36a2eb" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </CustomCard>
        </Grid>

        {/* Sales by Brand Card */}
        <Grid item xs={12} md={6}>
          <CustomCard>
            <CardHeader title="Sales by Brand" />
            <CardContent>
              <ResponsiveContainer
                width="100%"
                height={300}
                style={{ background: 'linear-gradient(135deg, #ffffff, #e0f7fa)' }}
              >
                <PieChart>
                  <Pie
                    data={brandSales}
                    dataKey="totalSold"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    label={({ payload, percent }) => {
                      const brandName = payload._id
                        ? payload._id.charAt(0).toUpperCase() + payload._id.slice(1)
                        : '';
                      return `${brandName} (${(percent * 100).toFixed(0)}%)`;
                    }}
                    labelLine={false}
                  >
                    {brandSales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </CustomCard>
        </Grid>

        {/* Purchases by Sex Card */}
        <Grid item xs={12}>
          <CustomCard>
            <CardHeader title="Purchases by Sex" />
            <CardContent>
              <ResponsiveContainer
                width="100%"
                height={300}
                style={{ background: 'linear-gradient(135deg, #ffffff, #e0f7fa)' }}
              >
                <BarChart
                  data={formattedSexSales}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: 'Total Purchased',
                      position: 'insideBottom',
                      offset: -5,
                      style: { fontSize: 14, fontWeight: 'bold' }
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="sex"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: 'Sex',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 14, fontWeight: 'bold' }
                    }}
                  />
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="left" wrapperStyle={{ fontSize: '12px', marginTop: 10 }} />
                  <Bar dataKey="totalSold" name="Total Purchased" fill="#ff4081" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </CustomCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminAnalytics;

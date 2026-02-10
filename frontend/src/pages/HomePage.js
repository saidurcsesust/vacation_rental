import React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const HomePage = () => {
  const navigate = useNavigate();

  const onSearch = (location) => {
    const qs = new URLSearchParams();
    if (location) qs.set('location', location);
    navigate(`/search?${qs.toString()}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Find your next vacation rental
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Search by location to view available properties.
        </Typography>
        <SearchBar onSearch={onSearch} />
      </Paper>
    </Container>
  );
};

export default HomePage;

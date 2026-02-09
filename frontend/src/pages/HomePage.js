import React, { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Container, Pagination, Paper, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import SearchBar from '../components/SearchBar';
import { propertyAPI } from '../services/api';

const PAGE_SIZE = 8;

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const [properties, setProperties] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await propertyAPI.getProperties({ page, page_size: PAGE_SIZE });
        if (mounted) {
          setProperties(res.data?.results || []);
          setCount(res.data?.count || 0);
          setError('');
        }
      } catch (_err) {
        if (mounted) {
          setError('Failed to load properties.');
          setProperties([]);
          setCount(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [page]);

  const onSearch = (location) => {
    const qs = new URLSearchParams();
    if (location) qs.set('location', location);
    navigate(`/search?${qs.toString()}`);
  };

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 5 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Find your next vacation rental
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Search properties by location and explore details before booking.
        </Typography>
        <SearchBar onSearch={onSearch} />
      </Paper>

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Featured properties
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
          }}
        >
          {properties.map((property) => (
            <Box key={property.id} sx={{ display: 'flex' }}>
              <PropertyCard property={property} />
            </Box>
          ))}
        </Box>

        {properties.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              color="primary"
              page={page}
              count={totalPages}
              onChange={(_event, value) => setSearchParams({ page: String(value) })}
            />
          </Box>
        )}
      )}
    </Container>
  );
};

export default HomePage;

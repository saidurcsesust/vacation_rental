import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import SearchBar from '../components/SearchBar';
import { propertyAPI } from '../services/api';

const PAGE_SIZE = 20;

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const location = searchParams.get('location') || '';
  const q = searchParams.get('q') || '';
  const page = Number(searchParams.get('page') || 1);
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  const [properties, setProperties] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          page_size: PAGE_SIZE,
          ...(location ? { location } : {}),
          ...(q ? { q } : {}),
          ...(minPrice ? { min_price: minPrice } : {}),
          ...(maxPrice ? { max_price: maxPrice } : {}),
        };

        const res = await propertyAPI.getProperties(params);
        if (mounted) {
          setProperties(res.data?.results || []);
          setCount(res.data?.count || 0);
          setError('');
        }
      } catch (_err) {
        if (mounted) {
          setError('Failed to fetch properties.');
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
  }, [location, q, page, minPrice, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams.toString());

    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, value);
    });

    if (!Object.prototype.hasOwnProperty.call(changes, 'page')) {
      next.set('page', '1');
    }

    navigate(`/search?${next.toString()}`);
  };

  const resultsLabel = useMemo(() => {
    if (location) return `Results for "${location}"`;
    if (q) return `Results for "${q}"`;
    return 'All properties';
  }, [location, q]);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        {resultsLabel}
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        <SearchBar
          compact
          initialLocation={location}
          onSearch={(value) => updateParams({ location: value, q: '', page: '1' })}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Min price"
            type="number"
            value={minPrice}
            onChange={(event) => updateParams({ min_price: event.target.value })}
          />
          <TextField
            label="Max price"
            type="number"
            value={maxPrice}
            onChange={(event) => updateParams({ max_price: event.target.value })}
          />
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {count} properties found
          </Typography>

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
              <Box key={property.id}>
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
                onChange={(_event, value) => updateParams({ page: String(value) })}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default SearchPage;

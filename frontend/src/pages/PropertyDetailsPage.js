import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, CircularProgress, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PeopleIcon from '@mui/icons-material/People';
import { useParams } from 'react-router-dom';
import { propertyAPI } from '../services/api';

const fallbackImage = 'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=1200';

const PropertyDetailsPage = () => {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await propertyAPI.getPropertyDetail(slug);
        if (mounted) {
          setProperty(res.data);
          setError('');
        }
      } catch (_err) {
        if (mounted) setError('Property not found.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const heroImage = useMemo(() => {
    if (!property?.images?.length) return fallbackImage;
    return property.images[0].final_url || property.images[0].image_url || fallbackImage;
  }, [property]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !property) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Alert severity="error">{error || 'Property not found.'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {property.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {property.location?.name}
          </Typography>

          <Box
            component="img"
            src={heroImage}
            alt={property.title}
            sx={{ width: '100%', height: 420, objectFit: 'cover', borderRadius: 2, mb: 3 }}
          />

          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Chip icon={<BedIcon />} label={`${property.bedrooms} Bedrooms`} />
            <Chip icon={<BathtubIcon />} label={`${property.bathrooms} Bathrooms`} />
            <Chip icon={<PeopleIcon />} label={`${property.max_guests} Guests`} />
          </Stack>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              About this property
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {property.description}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              ${property.price_per_night}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              per night
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PropertyDetailsPage;

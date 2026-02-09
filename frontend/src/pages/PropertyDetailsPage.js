import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PeopleIcon from '@mui/icons-material/People';
import PlaceIcon from '@mui/icons-material/Place';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useParams } from 'react-router-dom';
import { propertyAPI } from '../services/api';

const fallbackImage = 'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=1400';

const PropertyDetailsPage = () => {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [activeImage, setActiveImage] = useState(fallbackImage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await propertyAPI.getPropertyDetail(slug);
        if (!mounted) return;

        const data = res.data;
        setProperty(data);
        setError('');

        const firstImage = data?.images?.[0]?.final_url || data?.images?.[0]?.image_url || fallbackImage;
        setActiveImage(firstImage);
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

  const galleryImages = useMemo(() => {
    if (!property?.images?.length) return [fallbackImage];
    const urls = property.images
      .map((img) => img.final_url || img.image_url)
      .filter(Boolean);
    return urls.length ? urls : [fallbackImage];
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
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2.5fr 0.8fr' }, gap: 4 }}>
        <Box>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3 }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
              {property.title}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <PlaceIcon fontSize="small" color="action" />
              <Typography variant="body1" color="text.secondary">
                {property.location?.name}
              </Typography>
            </Stack>

            <Box
              component="img"
              src={activeImage}
              alt={property.title}
              sx={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 2, mb: 2 }}
            />

            <Box
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: {
                  xs: 'repeat(3, minmax(0, 1fr))',
                  sm: 'repeat(5, minmax(0, 1fr))',
                  md: 'repeat(6, minmax(0, 1fr))',
                },
              }}
            >
              {galleryImages.slice(0, 6).map((img, index) => (
                <Box
                  key={`${img}-${index}`}
                  component="img"
                  src={img}
                  alt={`${property.title} ${index + 1}`}
                  onClick={() => setActiveImage(img)}
                  sx={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    border: activeImage === img ? '2px solid' : '1px solid',
                    borderColor: activeImage === img ? 'primary.main' : 'divider',
                  }}
                />
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Property highlights
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip icon={<BedIcon />} label={`${property.bedrooms} Bedrooms`} />
              <Chip icon={<BathtubIcon />} label={`${property.bathrooms} Bathrooms`} />
              <Chip icon={<PeopleIcon />} label={`${property.max_guests} Guests`} />
            </Stack>
          </Paper>

          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
              About this property
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
              {property.description || 'No description available.'}
            </Typography>
          </Paper>
        </Box>

        <Box>
          <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h4" color="primary" fontWeight={800}>
              ${property.price_per_night}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              per night
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.25} sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleOutlineIcon color="success" fontSize="small" />
                <Typography variant="body2">Instant confirmation</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleOutlineIcon color="success" fontSize="small" />
                <Typography variant="body2">No booking fees</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleOutlineIcon color="success" fontSize="small" />
                <Typography variant="body2">Free cancellation in 24 hours</Typography>
              </Stack>
            </Stack>

            <Button variant="contained" fullWidth size="large">
              Reserve Now
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default PropertyDetailsPage;

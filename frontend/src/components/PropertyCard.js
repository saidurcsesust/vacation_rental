import React from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Typography } from '@mui/material';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';

const fallbackImage = 'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=1200';

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const cityCountry = [property.location_city, property.location_country].filter(Boolean).join(', ');

  return (
    <Card sx={{ width: '100%', height: '100%' }}>
      <CardActionArea
        onClick={() => navigate(`/property/${property.slug}`)}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <CardMedia
          component="img"
          image={property.primary_image || fallbackImage}
          alt={property.title}
          sx={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {property.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {property.location_name}
            {cityCountry ? ` • ${cityCountry}` : ''}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip size="small" icon={<BedIcon />} label={`${property.bedrooms} bed`} />
            <Chip size="small" icon={<BathtubIcon />} label={`${property.bathrooms} bath`} />
            <Chip size="small" icon={<PeopleIcon />} label={`${property.max_guests} guests`} />
          </Stack>

          <Typography variant="h6" color="primary" fontWeight="bold">
            ${property.price_per_night} / night
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PropertyCard;

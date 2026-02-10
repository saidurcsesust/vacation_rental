import React from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Box, Button, Container, CssBaseline, ThemeProvider, Toolbar, Typography, createTheme } from '@mui/material';
import HomePage from './pages/HomePage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import SearchPage from './pages/SearchPage';

const theme = createTheme({
  palette: {
    primary: { main: '#15616d' },
    secondary: { main: '#ff7d00' },
    background: { default: '#f8fafc' },
  },
});

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Property List', path: '/search' },
  ];

  return (
    <AppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer', fontWeight: 700, letterSpacing: 0.3 }}
          >
            Explore Rentals
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
                sx={{
                  fontWeight: 600,
                  borderBottom: location.pathname === item.path ? '2px solid' : '2px solid transparent',
                  borderRadius: 0,
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/property/:slug" element={<PropertyDetailsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

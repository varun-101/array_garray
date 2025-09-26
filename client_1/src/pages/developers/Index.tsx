import React from 'react';
import Navigation from '../../components/Navigation';
import HeroSection from '../../components/HeroSection';
import ProjectGrid from '../../components/ProjectGrid';
import Footer from '../../components/Footer';
import { Box } from '@mui/material';

const Index = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />
      <HeroSection />
      <ProjectGrid />
      <Footer />
    </Box>
  );
};

export default Index;

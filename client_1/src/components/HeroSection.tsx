import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Chip,
  Stack,
} from '@mui/material';
import {
  Rocket as RocketIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const stats = [
    { label: 'Active Projects', value: '2.4K+', icon: <RocketIcon /> },
    { label: 'Universities', value: '180+', icon: <SchoolIcon /> },
    { label: 'AI Insights', value: '15K+', icon: <PsychologyIcon /> },
    { label: 'Success Rate', value: '78%', icon: <TrendingUpIcon /> },
  ];

  const navigate = useNavigate();

  return (
    <Box
      sx={{
        background: 'var(--gradient-hero)',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
          animation: 'shimmer 3s infinite',
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              color: 'white',
              mb: 2,
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}
          >
            Where Engineering Dreams
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(45deg, #FFD700, #FF6B35)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
              }}
            >
              Come to Life
            </Box>
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Discover, adopt, and revive incredible engineering projects with AI-powered insights
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
            <Chip 
              label="AI-Powered Analysis" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600 
              }} 
            />
            <Chip 
              label="University Network" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600 
              }} 
            />
            <Chip 
              label="Industry Mentors" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600 
              }} 
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'hsl(var(--primary))',
                px: 4,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.95)',
                  transform: 'translateY(-2px)',
                  boxShadow: 'var(--shadow-elevated)',
                },
                transition: 'var(--transition-bounce)',
              }}
              onClick={() =>  navigate('/explore')}
            >
              Explore Projects
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: 'white',
                borderColor: 'white',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white',
                  transform: 'translateY(-2px)',
                },
                transition: 'var(--transition-bounce)',
              }}
              onClick={() => navigate('/mentor-form')}
            >
              Join as Mentor
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3,
            mt: 4,
          }}
        >
          {stats.map((stat, index) => (
            <Card
              key={index}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'var(--transition-smooth)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  bgcolor: 'rgba(255,255,255,0.15)',
                },
              }}
            >
              <CardContent sx={{ py: 3 }}>
                <Box sx={{ color: 'hsl(var(--accent))', mb: 1 }}>
                  {React.cloneElement(stat.icon, { fontSize: 'large' })}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
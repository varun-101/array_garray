import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'hsl(220, 25%, 8%)',
        color: 'white',
        py: 6,
        mt: 8,
        borderTop: '1px solid hsl(220, 20%, 20%)',
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 4,
            mb: 4,
          }}
        >
          {/* Brand */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CodeIcon sx={{ fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                ReGIT
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
              Empowering engineers to discover, adopt, and revive incredible side projects 
              with AI-powered insights.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="inherit" size="small">
                <GitHubIcon />
              </IconButton>
              <IconButton color="inherit" size="small">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" size="small">
                <LinkedInIcon />
              </IconButton>
              <IconButton color="inherit" size="small">
                <EmailIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Platform */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Platform
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Browse Projects
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Submit Project
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                AI Insights
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Mentor Program
              </Link>
            </Box>
          </Box>

          {/* Community */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Community
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Discord
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Forums
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Events
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Blog
              </Link>
            </Box>
          </Box>

          {/* Support */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Help Center
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Documentation
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Contact Us
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Privacy Policy
              </Link>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 3 }} />

        {/* Bottom Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} ReGIT. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Made with ❤️ by engineering students, for engineering students
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
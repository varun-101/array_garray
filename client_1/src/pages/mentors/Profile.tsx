import React from 'react';
import {
  Container,
  Box,
  Avatar,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
  Card,
  CardContent,
  Alert,
  Snackbar,
} from '@mui/material';
import Navigation from '../../components/Navigation';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const MentorProfile: React.FC = () => {
  const navigate = useNavigate();
  const { mentor, isMentorAuthenticated, logout } = useAuth();
  const [tab, setTab] = React.useState(0);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  React.useEffect(() => {
    if (!isMentorAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please login to access your profile',
        severity: 'error'
      });
      setTimeout(() => navigate('/mentor-login'), 2000);
    }
  }, [isMentorAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    setSnackbar({
      open: true,
      message: 'Logged out successfully',
      severity: 'success'
    });
    setTimeout(() => navigate('/mentor-login'), 1000);
  };

  if (!isMentorAuthenticated || !mentor) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>Loading...</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
          <Avatar 
            src={mentor.profilePhotoUrl || undefined} 
            alt={mentor.name} 
            sx={{ width: 96, height: 96, border: '3px solid white', boxShadow: 'var(--shadow-card)' }} 
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{mentor.name}</Typography>
            <Typography variant="h6" color="text.secondary">{mentor.role} • {mentor.organization}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Joined {new Date(mentor.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            onClick={handleLogout}
            sx={{ alignSelf: 'flex-start' }}
          >
            Logout
          </Button>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Overview" />
          <Tab label="Expertise" />
          <Tab label="Interests" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>About</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {mentor.name} is a {mentor.role} at {mentor.organization}, passionate about mentoring and guiding the next generation of developers.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {mentor.email}
              </Typography>
              {mentor.linkedinUrl && (
                <Typography variant="body2" color="text.secondary">
                  LinkedIn: <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer">{mentor.linkedinUrl}</a>
                </Typography>
              )}
              {mentor.githubUrl && (
                <Typography variant="body2" color="text.secondary">
                  GitHub: <a href={mentor.githubUrl} target="_blank" rel="noopener noreferrer">{mentor.githubUrl}</a>
                </Typography>
              )}
              {mentor.portfolioUrl && (
                <Typography variant="body2" color="text.secondary">
                  Portfolio: <a href={mentor.portfolioUrl} target="_blank" rel="noopener noreferrer">{mentor.portfolioUrl}</a>
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Professional Information</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={mentor.role} variant="outlined" sx={{ bgcolor: 'hsl(var(--primary))', color: 'white', borderColor: 'hsl(var(--primary))' }} />
                <Chip label={mentor.organization} variant="outlined" />
                <Chip label="Mentor" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Contact & Links</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {mentor.linkedinUrl && (
                  <Chip 
                    label="LinkedIn" 
                    variant="outlined" 
                    clickable
                    onClick={() => window.open(mentor.linkedinUrl, '_blank')}
                  />
                )}
                {mentor.githubUrl && (
                  <Chip 
                    label="GitHub" 
                    variant="outlined" 
                    clickable
                    onClick={() => window.open(mentor.githubUrl, '_blank')}
                  />
                )}
                {mentor.portfolioUrl && (
                  <Chip 
                    label="Portfolio" 
                    variant="outlined" 
                    clickable
                    onClick={() => window.open(mentor.portfolioUrl, '_blank')}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MentorProfile;



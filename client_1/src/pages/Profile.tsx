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
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const { user, isAuthenticated, loginWithGithub } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fallback mock for preview if not authenticated
  const profile = user || {
    name: 'Sophia Chen',
    username: 'sophiach',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256',
    email: 'sophia@example.com',
    githubUrl: 'https://github.com/sophia',
    joined: '2022',
    bio: "I'm a computer science student at State University passionate about building innovative solutions. I love collaborating on projects and learning from others.",
    skills: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Data Structures', 'Algorithms', 'Machine Learning'],
    interests: ['Web Development', 'Mobile Apps', 'AI', 'Open Source', 'Education', 'Sustainability'],
  } as any;

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
          <Avatar
            src={profile.avatar}
            alt={profile.name}
            sx={{ width: 96, height: 96, border: '3px solid white', boxShadow: 'var(--shadow-card)' }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {profile.name || 'Your Name'}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Aspiring Software Engineer
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Joined in {profile.joined || '—'}
            </Typography>
          </Box>
          <Button variant="outlined" sx={{ ml: 'auto' }} onClick={() => { if (!isAuthenticated) loginWithGithub(); }}>
            {isAuthenticated ? 'Edit Profile' : 'Login to Edit'}
          </Button>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Projects" />
          <Tab label="Skills" />
          <Tab label="Interests" />
        </Tabs>

        {/* Overview */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
            {/* Left column: Bio + Owned Projects preview */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Bio</Typography>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="body1">{profile.bio}</Typography>
                </CardContent>
              </Card>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Projects</Typography>
              <Card>
                <CardContent>
                  <Tabs value={0} aria-label="projects switch" sx={{ mb: 2 }}>
                    <Tab label="Owned" />
                    <Tab label="Adopted" disabled />
                  </Tabs>
                  <List>
                    <ListItem sx={{ alignItems: 'flex-start' }}>
                      <Box sx={{ width: 56, height: 40, bgcolor: 'hsl(var(--muted))', borderRadius: 1, mr: 2 }} />
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="FEATURED" size="small" sx={{ bgcolor: 'hsl(var(--accent))', color: 'white' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>EcoTrack</Typography>
                          </Box>
                        }
                        secondary="A web app for tracking your carbon footprint and promoting sustainable habits."
                      />
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ alignItems: 'flex-start' }}>
                      <Box sx={{ width: 56, height: 40, bgcolor: 'hsl(var(--muted))', borderRadius: 1, mr: 2 }} />
                      <ListItemText
                        primary={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>StudyBuddy</Typography>}
                        secondary="A platform connecting students for study groups and collaborative learning."
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>

            {/* Right column: Skills + Interests */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Skills</Typography>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {profile && profile.skills?.map((s: string, i: number) => (
                      <Chip key={i} label={s} variant="outlined" sx={{ bgcolor: 'hsl(var(--primary))', color: 'white', borderColor: 'hsl(var(--primary))' }} />
                    ))}
                  </Box>
                </CardContent>
              </Card>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Interests</Typography>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {profile.interests?.map((s: string, i: number) => (
                      <Chip key={i} label={s} variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Projects Tab placeholder */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1" color="text.secondary">Projects list coming soon.</Typography>
        </TabPanel>

        {/* Skills Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {profile.skills?.map((s: string, i: number) => (
              <Chip key={i} label={s} variant="outlined" />
            ))}
          </Box>
        </TabPanel>

        {/* Interests Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {profile.interests?.map((s: string, i: number) => (
              <Chip key={i} label={s} variant="outlined" />
            ))}
          </Box>
        </TabPanel>
      </Container>
    </>
  );
};

export default Profile;



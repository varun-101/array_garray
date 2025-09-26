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
} from '@mui/material';
import Navigation from '../../components/Navigation';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const MentorProfile: React.FC = () => {
  const [tab, setTab] = React.useState(0);

  const mentor = {
    name: 'Dr. Jordan Reed',
    avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=256',
    role: 'Senior Software Architect',
    organization: 'TechBridge Labs',
    joined: '2021',
    bio: 'Mentor passionate about scalable systems, developer experience, and guiding the next generation of engineers.',
    expertise: ['System Design', 'Distributed Systems', 'Node.js', 'React', 'Cloud', 'Databases'],
    interests: ['Mentorship', 'Open Source', 'Career Guidance'],
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
          <Avatar src={mentor.avatar} alt={mentor.name} sx={{ width: 96, height: 96, border: '3px solid white', boxShadow: 'var(--shadow-card)' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{mentor.name}</Typography>
            <Typography variant="h6" color="text.secondary">{mentor.role} • {mentor.organization}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Joined in {mentor.joined}</Typography>
          </Box>

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
              <Typography variant="body1">{mentor.bio}</Typography>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Areas of Expertise</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {mentor.expertise.map((e, i) => (
                  <Chip key={i} label={e} variant="outlined" sx={{ bgcolor: 'hsl(var(--primary))', color: 'white', borderColor: 'hsl(var(--primary))' }} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Interests</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {mentor.interests.map((e, i) => (
                  <Chip key={i} label={e} variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Container>
    </>
  );
};

export default MentorProfile;



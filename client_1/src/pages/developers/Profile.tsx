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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';

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
  console.log({user})
  const [tabValue, setTabValue] = React.useState(0);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingProfile, setEditingProfile] = React.useState<any>({});
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [fetchedProfile, setFetchedProfile] = React.useState<any>(null);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch user profile data from backend
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.githubId || !isAuthenticated) {
        return;
      }

      setLoading(true);
      try {
        const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiBase}/api/users/${user.githubId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const result = await response.json();
        if (result.success) {
          setFetchedProfile(result.data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load profile data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.githubId, isAuthenticated]);

  const handleEditProfile = () => {
    if (!isAuthenticated) {
      loginWithGithub();
      return;
    }
    
    // Initialize editing profile with fetched profile data or fallback to user data
    const profileData = fetchedProfile || user;
    setEditingProfile({
      name: profileData?.name || '',
      bio: profileData?.bio || '',
      title: profileData?.title || 'Aspiring Software Engineer',
      joined: profileData?.joined || '',
      skills: profileData?.skills || [],
      interests: profileData?.interests || [],
    });
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!user?.githubId) return;
    
    setSaving(true);
    try {
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/users/${user.githubId}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingProfile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      
      setEditDialogOpen(false);
      
      // Update the fetched profile data with the response
      if (updatedUser.success) {
        setFetchedProfile(updatedUser.data);
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingProfile({});
  };

  const handleAddSkill = () => {
    setEditingProfile(prev => ({
      ...prev,
      skills: [...(prev.skills || []), '']
    }));
  };

  const handleRemoveSkill = (index: number) => {
    setEditingProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSkillChange = (index: number, value: string) => {
    setEditingProfile(prev => ({
      ...prev,
      skills: prev.skills.map((skill: string, i: number) => i === index ? value : skill)
    }));
  };

  const handleAddInterest = () => {
    setEditingProfile(prev => ({
      ...prev,
      interests: [...(prev.interests || []), '']
    }));
  };

  const handleRemoveInterest = (index: number) => {
    setEditingProfile(prev => ({
      ...prev,
      interests: prev.interests.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleInterestChange = (index: number, value: string) => {
    setEditingProfile(prev => ({
      ...prev,
      interests: prev.interests.map((interest: string, i: number) => i === index ? value : interest)
    }));
  };

  // Merge fetched profile with safe defaults so arrays/fields always exist
  const defaultProfile = {
    name: 'Your Name',
    username: 'username',
    avatar: '',
    email: '',
    githubUrl: '',
    joined: '',
    bio: "Tell us about yourself...",
    skills: [],
    interests: [],
    title: 'Aspiring Software Engineer',
  } as const;

  // Use fetched profile data if available, otherwise fallback to user data, then defaults
  const profileData = fetchedProfile || user;
  const profile = { 
    ...defaultProfile, 
    ...(profileData || {}),
    // Ensure arrays are arrays even if profileData provides undefined/null
    skills: profileData?.skills ?? defaultProfile.skills,
    interests: profileData?.interests ?? defaultProfile.interests,
  } as any;

  // Show loading state while fetching profile data
  if (loading && isAuthenticated) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

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
                {profile.title || 'Aspiring Software Engineer'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {profile.joined ? `Joined in ${profile.joined}` : '—'}
              </Typography>
          </Box>
          <Button 
            variant="outlined" 
            sx={{ ml: 'auto' }} 
            startIcon={<EditIcon />}
            onClick={handleEditProfile}
          >
            {isAuthenticated ? 'Edit Profile' : 'Login to Edit'}
          </Button>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
         
        </Tabs>

        {/* Overview */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
            {/* Left column: Bio + Owned Projects preview */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Bio</Typography>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="body1">
                    {profile.bio || 'No bio available. Click "Edit Profile" to add your bio.'}
                  </Typography>
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
                    {profile && profile.skills && profile.skills.length > 0 ? (
                      profile.skills.map((s: string, i: number) => (
                        <Chip key={i} label={s} variant="outlined" sx={{ bgcolor: 'hsl(var(--primary))', color: 'white', borderColor: 'hsl(var(--primary))' }} />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No skills added yet. Click "Edit Profile" to add your skills.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Interests</Typography>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {profile.interests && profile.interests.length > 0 ? (
                      profile.interests.map((s: string, i: number) => (
                        <Chip key={i} label={s} variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No interests added yet. Click "Edit Profile" to add your interests.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>


      </Container>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCancelEdit}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon />
            <Typography variant="h6">Edit Profile</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Name"
                  value={editingProfile.name || ''}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, name: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Title"
                  value={editingProfile.title || ''}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, title: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Joined Year"
                  value={editingProfile.joined || ''}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, joined: e.target.value }))}
                  fullWidth
                  placeholder="e.g., 2022"
                />
                <TextField
                  label="Bio"
                  value={editingProfile.bio || ''}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, bio: e.target.value }))}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </Box>
            </Box>

            {/* Skills */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Skills</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddSkill}
                  size="small"
                  variant="outlined"
                >
                  Add Skill
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {editingProfile.skills?.map((skill: string, index: number) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      fullWidth
                      size="small"
                      placeholder="Enter a skill"
                    />
                    <IconButton
                      onClick={() => handleRemoveSkill(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Interests */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Interests</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddInterest}
                  size="small"
                  variant="outlined"
                >
                  Add Interest
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {editingProfile.interests?.map((interest: string, index: number) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      value={interest}
                      onChange={(e) => handleInterestChange(index, e.target.value)}
                      fullWidth
                      size="small"
                      placeholder="Enter an interest"
                    />
                    <IconButton
                      onClick={() => handleRemoveInterest(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCancelEdit}
            startIcon={<CancelIcon />}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            variant="contained"
            disabled={saving}
            sx={{
              bgcolor: 'hsl(var(--primary))',
              '&:hover': { bgcolor: 'hsl(var(--primary-hover))' }
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default Profile;



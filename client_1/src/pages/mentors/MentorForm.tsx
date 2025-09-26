import React from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Navigation from '../../components/Navigation';
import { uploadFileToBucket } from '../../lib/appwrite';

const MentorForm: React.FC = () => {
  const [form, setForm] = React.useState({
    name: '',
    organization: '',
    role: '',
    email: '',
    links: '',
    password: '',
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const { url } = await uploadFileToBucket(file, {
        userId: 'mentor',
        projectSlug: 'profiles',
        kind: 'image'
      });
      setPhotoPreview(url);
      setSnackbar({
        open: true,
        message: 'Photo uploaded successfully!',
        severity: 'success'
      });
      return url;
    } catch (error) {
      console.error('Photo upload failed:', error);
      setSnackbar({
        open: true,
        message: 'Failed to upload photo. Please try again.',
        severity: 'error'
      });
      throw error;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      let profilePhotoUrl = null;
      
      // Upload photo to Appwrite if selected
      if (photoFile) {
        profilePhotoUrl = await handlePhotoUpload(photoFile);
      }

      // Prepare mentor data
      const mentorData = {
        name: form.name,
        organization: form.organization,
        role: form.role,
        email: form.email,
        password: form.password,
        profilePhotoUrl,
        linkedinUrl: form.links.includes('linkedin') ? form.links : null,
        githubUrl: form.links.includes('github') ? form.links : null,
        portfolioUrl: form.links && !form.links.includes('linkedin') && !form.links.includes('github') ? form.links : null,
      };

      // Submit to backend
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/mentors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mentorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit mentor application');
      }

      // Reset form on success
      setForm({ name: '', organization: '', role: '', email: '', links: '', password: '' });
      setPhotoFile(null);
      setPhotoPreview(null);
      
      setSnackbar({
        open: true,
        message: 'Mentor application submitted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Submission failed:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to submit application',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          Mentor Feedback & Engagement Form
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Share your details to help us connect students with the right mentors.
        </Typography>

        <Card sx={{ boxShadow: 'var(--shadow-card)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Mentor Details
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
              {/* Profile Picture */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={photoPreview || undefined} sx={{ width: 64, height: 64 }} />
                <input
                  id="mentor-photo-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPhotoFile(file);
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setPhotoPreview(url);
                    } else {
                      setPhotoPreview(null);
                    }
                  }}
                />
                <label htmlFor="mentor-photo-input">
                  <Button 
                    variant="outlined" 
                    component="span"
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? 'Uploading...' : photoFile ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                </label>
              </Stack>
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Organization/Company"
                name="organization"
                value={form.organization}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Role/Designation"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="LinkedIn/GitHub/Portfolio (optional)"
                name="links"
                value={form.links}
                onChange={handleChange}
                placeholder="e.g. LinkedIn, GitHub, personal site"
                fullWidth
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || uploadingPhoto}
                  sx={{ bgcolor: 'hsl(var(--primary))', '&:hover': { bgcolor: 'hsl(var(--primary-hover))' } }}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
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

export default MentorForm;



import React from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Navigation from '../../components/Navigation';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Placeholder: integrate with backend later
      await new Promise(r => setTimeout(r, 600));
      // Reset form on success for now
      setForm({ name: '', organization: '', role: '', email: '', links: '', password: '' });
      setPhotoFile(null);
      setPhotoPreview(null);
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
                  <Button variant="outlined" component="span">
                    {photoFile ? 'Change Photo' : 'Upload Photo'}
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
                  disabled={submitting}
                  sx={{ bgcolor: 'hsl(var(--primary))', '&:hover': { bgcolor: 'hsl(var(--primary-hover))' } }}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default MentorForm;



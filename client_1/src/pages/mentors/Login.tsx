import React from 'react';
import { Container, Box, Typography, TextField, Button, Card, CardContent, Alert, Snackbar } from '@mui/material';
import Navigation from '../../components/Navigation';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MentorLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginMentor } = useAuth();
  const [form, setForm] = React.useState({ email: '', password: '' });
  const [submitting, setSubmitting] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
       const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/mentors/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const mentorData = await response.json();
      
      // Use AuthContext to manage mentor session
      loginMentor(mentorData);
      
      setSnackbar({
        open: true,
        message: 'Login successful! Redirecting...',
        severity: 'success'
      });
      
      // Navigate to profile after a short delay
      setTimeout(() => {
        navigate('/mentor-profile');
      }, 1000);
      
    } catch (error) {
      console.error('Login failed:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Login failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Mentor Login</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
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
              <Button type="submit" variant="contained" disabled={submitting} sx={{ bgcolor: 'hsl(var(--primary))', '&:hover': { bgcolor: 'hsl(var(--primary-hover))' } }}>
                {submitting ? 'Logging in...' : 'Login'}
              </Button>
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

export default MentorLogin;



import React from 'react';
import { Container, Box, Typography, TextField, Button, Card, CardContent } from '@mui/material';
import Navigation from '../../components/Navigation';
import { useNavigate } from 'react-router-dom';

const MentorLogin: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ email: '', password: '' });
  const [submitting, setSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      navigate('/mentor-profile');
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
    </>
  );
};

export default MentorLogin;



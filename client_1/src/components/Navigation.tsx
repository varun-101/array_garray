import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';



const Navigation: React.FC = () => {
  const { isAuthenticated, user, loginWithGithub, logout } = useAuth();
  // const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const navigate = useNavigate();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'var(--gradient-primary)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid hsl(var(--border))',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="ReGIT Logo"
            sx={{ width: 28, height: 28, borderRadius: '4px' }}
          />
          <Typography
            variant="h5"
            component="div"
            className='cursor-pointer'
            sx={{
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
              '&:hover': { opacity: 0.9 }
            }}
            onClick={() => navigate('/')}
          >
            ReGIT
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="text"
            sx={{
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}

            onClick={() => navigate('/explore')}
          >
            Explore
          </Button>
          <Button
            variant="text"
            sx={{
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
            onClick={() => navigate('/my-projects')}
          >
            My Projects
          </Button>
          
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button onClick={() => navigate('/add-project')}
                startIcon={<AddIcon />}
                variant="contained"
                sx={{
                  bgcolor: 'hsl(var(--accent))',
                  color: 'white',
                  '&:hover': { bgcolor: 'hsl(var(--accent))' }
                }}
              >
                Submit Project
              </Button>
              
              <IconButton color="inherit">
                <Badge badgeContent={3} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ p: 0.5 }}
              >
                <Avatar
                  src={user?.avatar}
                  alt={user?.name}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<PersonIcon />}
                sx={{
                  bgcolor: 'white',
                  color: 'hsl(var(--primary))',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                }}
                onClick={() => navigate('/mentor-login')}
              >
                Login as Mentor
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonIcon />}
                sx={{
                  bgcolor: 'white',
                  color: 'hsl(var(--primary))',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                }}
                onClick={loginWithGithub}
              >
                Login as Developer
              </Button>
            </Box>
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{ mt: 1 }}
        >
          <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>Profile</MenuItem>
          <MenuItem onClick={handleMenuClose}>My Projects</MenuItem>
          <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); logout(); }}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
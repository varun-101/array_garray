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
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';



const Navigation: React.FC = () => {
  const { 
    isAuthenticated, 
    isMentorAuthenticated  , 
    userType, 
    user, 
    mentor, 
    loginWithGithub, 
    logout 
  } = useAuth();
  // const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);

  const navigate = useNavigate();

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      title: "New Project Submission",
      message: "Your project 'AI Chatbot' has been successfully submitted for review.",
      type: "success",
      time: "2 minutes ago",
      icon: <CheckCircleIcon />,
    },
    {
      id: 2,
      title: "Project Update Required",
      message: "Please update your project documentation to meet our latest standards.",
      type: "warning",
      time: "1 hour ago",
      icon: <WarningIcon />,
    },
  ];

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'hsl(140, 70%, 50%)';
      case 'warning':
        return 'hsl(45, 90%, 60%)';
      case 'info':
        return 'hsl(220, 85%, 55%)';
      default:
        return 'hsl(220, 15%, 65%)';
    }
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'hsl(220, 25%, 8%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid hsl(220, 20%, 20%)',
        boxShadow: '0 4px 20px hsl(0, 0%, 0%, 0.3)'
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
          {userType === 'developer' && (
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
          )}
          
          {isAuthenticated || isMentorAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             {userType === 'developer' && (
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
              )}
              
              <IconButton 
                color="inherit"
                onClick={handleNotificationClick}
              >
                <Badge badgeContent={notifications.length} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ p: 0.5 }}
              >
                <Avatar
                  src={userType === 'developer' ? user?.avatar : mentor?.profilePhotoUrl}
                  alt={userType === 'developer' ? user?.name : mentor?.name}
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
                  color: 'hsl(220, 85%, 55%)',
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
                  color: 'hsl(220, 85%, 55%)',
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
          <MenuItem onClick={() => { 
            handleMenuClose(); 
            navigate(userType === 'developer' ? '/profile' : '/mentor-profile'); 
          }}>
            Profile
          </MenuItem>
          {userType === 'developer' && (
            <MenuItem onClick={handleMenuClose}>My Projects</MenuItem>
          )}
          <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); logout(); }}>Logout</MenuItem>
        </Menu>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationClose}
          sx={{ 
            mt: 1,
            '& .MuiPaper-root': {
              bgcolor: 'hsl(220, 20%, 12%)',
              border: '1px solid hsl(220, 20%, 20%)',
              borderRadius: 2,
              minWidth: 350,
              maxWidth: 400,
            }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid hsl(220, 20%, 20%)' }}>
            <Typography variant="h6" sx={{ color: 'hsl(220, 15%, 92%)', fontWeight: 600 }}>
              Notifications
            </Typography>
            <Typography variant="body2" sx={{ color: 'hsl(220, 15%, 65%)' }}>
              {notifications.length} new notifications
            </Typography>
          </Box>
          
          {notifications.map((notification) => (
            <MenuItem 
              key={notification.id}
              onClick={handleNotificationClose}
              sx={{ 
                p: 2,
                borderBottom: '1px solid hsl(220, 20%, 20%)',
                '&:hover': {
                  bgcolor: 'hsl(220, 20%, 15%)',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    color: getNotificationColor(notification.type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: `${getNotificationColor(notification.type)}20`,
                  }}
                >
                  {notification.icon}
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: 'hsl(220, 15%, 92%)',
                      fontWeight: 600,
                      mb: 0.5
                    }}
                  >
                    {notification.title}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'hsl(220, 15%, 65%)',
                        mb: 1,
                        lineHeight: 1.4
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Chip
                      label={notification.time}
                      size="small"
                      sx={{
                        bgcolor: 'hsl(220, 20%, 20%)',
                        color: 'hsl(220, 15%, 65%)',
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                  </Box>
                }
              />
            </MenuItem>
          ))}
          
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button
              variant="text"
              size="small"
              sx={{
                color: 'hsl(220, 85%, 55%)',
                '&:hover': {
                  bgcolor: 'hsl(220, 20%, 15%)',
                }
              }}
            >
              View All Notifications
            </Button>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
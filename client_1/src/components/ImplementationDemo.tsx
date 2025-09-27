import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Code as CodeIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  GitHub as GitHubIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  OpenInNew as OpenInNewIcon,
  PlayArrow as PlayArrowIcon,
  Build as BuildIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  BugReport as BugReportIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import CodeImplementations from './CodeImplementations';
import ImplementationHistory from './ImplementationHistory';

const ImplementationDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'recommendations' | 'history' | 'full'>('full');

  const mockProjectData = {
    projectName: 'My Awesome Project',
    techStack: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
    repoUrl: 'https://github.com/username/awesome-project',
    aiAnalysis: {
      codeQuality: 75,
      maintainability: 80,
      recommendations: [
        'Add comprehensive error handling to API endpoints',
        'Implement input validation for user forms',
        'Add unit tests for critical business logic'
      ],
      improvements: [
        'Add automated testing framework',
        'Implement code coverage reporting',
        'Add performance monitoring',
        'Create API documentation'
      ]
    }
  };

  const mockHistoryData = [
    {
      id: '1',
      title: 'Add Error Handling',
      category: 'Quality',
      status: 'completed',
      createdAt: '2024-01-15T10:30:00Z',
      duration: 1200000, // 20 minutes
      pullRequest: {
        success: true,
        url: 'https://github.com/username/awesome-project/pull/123',
        number: 123
      }
    },
    {
      id: '2',
      title: 'Implement Input Validation',
      category: 'Security',
      status: 'completed',
      createdAt: '2024-01-14T14:20:00Z',
      duration: 900000, // 15 minutes
      pullRequest: {
        success: true,
        url: 'https://github.com/username/awesome-project/pull/122',
        number: 122
      }
    },
    {
      id: '3',
      title: 'Add Unit Tests',
      category: 'Testing',
      status: 'processing',
      createdAt: '2024-01-16T09:15:00Z',
      progress: 65
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon color="success" />;
      case 'failed': return <ErrorIcon color="error" />;
      case 'processing': return <ScheduleIcon color="warning" />;
      default: return <ScheduleIcon />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security': return <SecurityIcon />;
      case 'Performance': return <SpeedIcon />;
      case 'Testing': return <BugReportIcon />;
      case 'Quality': return <CodeIcon />;
      case 'Documentation': return <DescriptionIcon />;
      default: return <BuildIcon />;
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    return `${minutes}m`;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
          Implementation Tracking & History Demo
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Experience the new MongoDB-powered implementation tracking with beautiful animations and real-time progress updates.
        </Typography>

        {/* Demo Navigation */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Button
            variant={activeDemo === 'full' ? 'contained' : 'outlined'}
            onClick={() => setActiveDemo('full')}
            sx={{ mr: 2 }}
            startIcon={<CodeIcon />}
          >
            Full Experience
          </Button>
          <Button
            variant={activeDemo === 'recommendations' ? 'contained' : 'outlined'}
            onClick={() => setActiveDemo('recommendations')}
            sx={{ mr: 2 }}
            startIcon={<BuildIcon />}
          >
            Recommendations Only
          </Button>
          <Button
            variant={activeDemo === 'history' ? 'contained' : 'outlined'}
            onClick={() => setActiveDemo('history')}
            startIcon={<HistoryIcon />}
          >
            History Only
          </Button>
        </Box>

        {/* Features Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                      <HistoryIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      MongoDB Tracking
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    All implementations are tracked in MongoDB with detailed logs, progress, and metadata for comprehensive history.
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                      <AssessmentIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Beautiful Animations
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Smooth animations and transitions powered by Framer Motion for an engaging user experience.
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                      <GitHubIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Real-time Progress
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Live progress tracking with step-by-step updates and pull request integration.
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Demo Content */}
        {activeDemo === 'full' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CodeImplementations
              aiAnalysis={mockProjectData.aiAnalysis}
              projectName={mockProjectData.projectName}
              techStack={mockProjectData.techStack}
              repoUrl={mockProjectData.repoUrl}
              showHistory={true}
            />
          </motion.div>
        )}

        {activeDemo === 'recommendations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CodeImplementations
              aiAnalysis={mockProjectData.aiAnalysis}
              projectName={mockProjectData.projectName}
              techStack={mockProjectData.techStack}
              repoUrl={mockProjectData.repoUrl}
              showHistory={false}
            />
          </motion.div>
        )}

        {activeDemo === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ImplementationHistory
              projectName={mockProjectData.projectName}
              repoUrl={mockProjectData.repoUrl}
              showStatistics={true}
            />
          </motion.div>
        )}

        {/* Mock History Data for Demo */}
        {activeDemo === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Mock Implementation History
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  This is mock data to demonstrate the history view. In a real implementation, this would come from MongoDB.
                </Alert>
                
                <List>
                  {mockHistoryData.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                          {getStatusIcon(item.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {item.title}
                              </Typography>
                              <Chip
                                icon={getCategoryIcon(item.category)}
                                label={item.category}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </Typography>
                              {item.duration && (
                                <Typography variant="body2" color="text.secondary">
                                  Duration: {formatDuration(item.duration)}
                                </Typography>
                              )}
                              {item.progress && (
                                <Typography variant="body2" color="text.secondary">
                                  Progress: {item.progress}%
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        {item.pullRequest?.success && (
                          <Tooltip title="View Pull Request">
                            <IconButton
                              onClick={() => window.open(item.pullRequest.url, '_blank')}
                              color="primary"
                            >
                              <OpenInNewIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </ListItem>
                      {index < mockHistoryData.length - 1 && <Divider />}
                    </motion.div>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* API Endpoints Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                New API Endpoints
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The following new endpoints have been added to support implementation tracking:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="GET /api/implementation/history"
                    secondary="Get implementation history with pagination and filtering"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="GET /api/implementation/statistics"
                    secondary="Get implementation statistics and analytics"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="GET /api/implementation/batch/:batchId"
                    secondary="Get batch implementation details"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="POST /api/implementation/generate (Enhanced)"
                    secondary="Now saves implementation records to MongoDB"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="POST /api/implementation/batch (Enhanced)"
                    secondary="Now tracks batch implementations with batch IDs"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default ImplementationDemo;

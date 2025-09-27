import * as React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Slide,
  Zoom,
  Backdrop
} from '@mui/material';
import {
  Code as CodeIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  GitHub as GitHubIcon,
  Timeline as TimelineIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  BugReport as BugReportIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface ImplementationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  icon: React.ReactNode;
  progress?: number;
  details?: string;
}

interface ImplementationLoaderProps {
  isVisible: boolean;
  implementationTitle: string;
  steps: ImplementationStep[];
  currentStep: number;
  overallProgress: number;
  onClose?: () => void;
  showDetails?: boolean;
}

const ImplementationLoader: React.FC<ImplementationLoaderProps> = ({
  isVisible,
  implementationTitle,
  steps,
  currentStep,
  overallProgress,
  onClose,
  showDetails = true
}) => {
  const getStepIcon = (step: ImplementationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'processing':
        return <CircularProgress size={20} />;
      default:
        return step.icon;
    }
  };

  const getStepColor = (step: ImplementationStep) => {
    switch (step.status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'processing':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (!isVisible) return null;

  return (
    <Backdrop
      open={isVisible}
      sx={{
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Card
          sx={{
            maxWidth: 600,
            width: '90vw',
            maxHeight: '80vh',
            overflow: 'auto',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 3,
                    animation: 'pulse 2s infinite'
                  }}
                >
                  <CodeIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    Implementing Code Changes
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {implementationTitle}
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            {/* Overall Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Overall Progress
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {Math.round(overallProgress)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={overallProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white',
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            </motion.div>

            {/* Steps */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, opacity: 0.9 }}>
                Implementation Steps
              </Typography>
              
              <List sx={{ mb: 3 }}>
                <AnimatePresence>
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      layout
                    >
                      <ListItem
                        sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: step.status === 'processing' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(255, 255, 255, 0.05)',
                          border: step.status === 'processing' 
                            ? '2px solid rgba(255, 255, 255, 0.3)' 
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, mr: 2 }}>
                          <motion.div
                            animate={step.status === 'processing' ? { rotate: 360 } : { rotate: 0 }}
                            transition={{ 
                              duration: 2, 
                              repeat: step.status === 'processing' ? Infinity : 0,
                              ease: 'linear'
                            }}
                          >
                            {getStepIcon(step)}
                          </motion.div>
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {step.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                                {step.description}
                              </Typography>
                              
                              {step.status === 'processing' && step.progress !== undefined && (
                                <Box sx={{ mb: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={step.progress}
                                    sx={{
                                      height: 4,
                                      borderRadius: 2,
                                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: 'white'
                                      }
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                    {Math.round(step.progress)}%
                                  </Typography>
                                </Box>
                              )}
                              
                              {step.details && (
                                <Typography variant="caption" sx={{ opacity: 0.7, fontStyle: 'italic' }}>
                                  {step.details}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        
                        <Chip
                          label={step.status.toUpperCase()}
                          color={getStepColor(step) as any}
                          size="small"
                          variant="filled"
                          sx={{ 
                            ml: 2,
                            backgroundColor: step.status === 'processing' 
                              ? 'rgba(255, 255, 255, 0.2)' 
                              : undefined
                          }}
                        />
                      </ListItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </List>
            </motion.div>

            {/* Current Step Details */}
            {showDetails && currentStep < steps.length && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, opacity: 0.9 }}>
                    Current Step: {steps[currentStep]?.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {steps[currentStep]?.description}
                  </Typography>
                  
                  {steps[currentStep]?.status === 'processing' && (
                    <Box sx={{ mt: 2 }}>
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          Processing... Please wait while we implement your changes.
                        </Typography>
                      </motion.div>
                    </Box>
                  )}
                </Box>
              </motion.div>
            )}

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  This process may take a few minutes. Please don't close this window.
                </Typography>
              </Box>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Backdrop>
  );
};

export default ImplementationLoader;

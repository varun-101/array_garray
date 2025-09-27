import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  LinearProgress,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Favorite as FavoriteIcon,
  Group as GroupIcon,
  Psychology as PsychologyIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from '@mui/icons-material';
import { Project } from '../store/slices/projectsSlice';
import { useAuth } from '../context/AuthContext';

interface ProjectCardProps {
  project: Project;
  onViewDetails?: (project: Project) => void;
  onAdopt?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewDetails,
  onAdopt,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [collaborationStatus, setCollaborationStatus] = useState<{
    isOwner: boolean;
    collaboration: {
      status: 'pending' | 'accepted' | 'declined';
      invitedAt: string;
      respondedAt?: string;
    } | null;
    githubStatus?: {
      isCollaborator: boolean;
      permission?: string;
      role_name?: string;
      error?: string;
    } | null;
  } | null>(null);
  const [isAdopting, setIsAdopting] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

  // Fetch collaboration status when component mounts
  useEffect(() => {
    const fetchCollaborationStatus = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      setIsLoadingStatus(true);
      try {
        // First get the current status
        const response = await fetch(`${apiBase}/api/projects/${project.id}/collaboration-status?userId=${user.id}`);
        if (response.ok) {
          const status = await response.json();
          setCollaborationStatus(status);
          
          // If status is pending, try to sync with GitHub to get latest status
          if (status.collaboration?.status === 'pending') {
            try {
              const syncResponse = await fetch(`${apiBase}/api/projects/${project.id}/sync-github-status?userId=${user.id}`);
              if (syncResponse.ok) {
                const syncResult = await syncResponse.json();
                if (syncResult.updatedStatus) {
                  // Re-fetch the updated status
                  const updatedResponse = await fetch(`${apiBase}/api/projects/${project.id}/collaboration-status?userId=${user.id}`);
                  if (updatedResponse.ok) {
                    const updatedStatus = await updatedResponse.json();
                    setCollaborationStatus(updatedStatus);
                  }
                }
              }
            } catch (syncError) {
              console.error('Error syncing GitHub status:', syncError);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching collaboration status:', error);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchCollaborationStatus();
  }, [project.id, user?.id, isAuthenticated, apiBase]);

  const handleAdoptProject = async () => {
    if (!isAuthenticated || !user?.id) {
      // Redirect to login or show login modal
      return;
    }

    setIsAdopting(true);
    try {
      const response = await fetch(`${apiBase}/api/projects/${project.id}/adopt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        // Update collaboration status
        setCollaborationStatus({
          isOwner: false,
          collaboration: {
            status: 'pending',
            invitedAt: new Date().toISOString(),
          }
        });
        onAdopt?.(project);
      } else {
        const errorData = await response.json();
        console.error('Error adopting project:', errorData.error);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error adopting project:', error);
    } finally {
      setIsAdopting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'seeking-contributors':
        return 'hsl(140, 70%, 50%)';
      case 'in-progress':
        return 'hsl(45, 90%, 60%)';
      case 'completed':
        return 'hsl(220, 85%, 65%)';
      case 'paused':
        return 'hsl(220, 15%, 65%)';
      default:
        return 'hsl(220, 15%, 65%)';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'hsl(140, 70%, 50%)';
      case 'intermediate':
        return 'hsl(45, 90%, 60%)';
      case 'advanced':
        return 'hsl(0, 75%, 60%)';
      default:
        return 'hsl(220, 15%, 65%)';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        boxShadow: '0 4px 20px hsl(0, 0%, 0%, 0.3)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px hsl(0, 0%, 0%, 0.4)',
        },
      }}
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Header with AI Health Score */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {project.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar
                src={project.author.avatar}
                alt={project.author.name}
                sx={{ width: 24, height: 24 }}
              />
              <Typography variant="body2" color="text.secondary">
                {project.author.name} • {project.author.university}
              </Typography>
            </Box>
          </Box>
          
          <Tooltip title={`AI Health Score: ${project.aiHealthScore}%`}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: project.aiHealthScore > 80 ? 'hsl(140, 70%, 50%)' : 
                           project.aiHealthScore > 60 ? 'hsl(45, 90%, 60%)' : 'hsl(0, 75%, 60%)',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
              <PsychologyIcon sx={{ fontSize: 14 }} />
              {project.aiHealthScore}%
            </Box>
          </Tooltip>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {project.description}
        </Typography>

        {/* Status and Difficulty */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={project.status.replace('-', ' ').toUpperCase()}
            size="small"
            sx={{
              bgcolor: getStatusColor(project.status),
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
          <Chip
            label={project.difficulty.toUpperCase()}
            size="small"
            sx={{
              bgcolor: getDifficultyColor(project.difficulty),
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
          <Chip
            label={project.estimatedTime}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>

        {/* Tech Stack */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Tech Stack:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {project.techStack.slice(0, 4).map((tech, index) => (
              <Chip
                key={index}
                label={tech}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            ))}
            {project.techStack.length > 4 && (
              <Chip
                label={`+${project.techStack.length - 4}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            )}
          </Box>
        </Box>

        {/* Contributors */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {project.contributors} contributors
          </Typography>
          <Typography variant="caption" color="text.secondary">
            • Updated {new Date(project.lastUpdated).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {project.githubUrl && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                window.open(project.githubUrl, '_blank');
              }}
            >
              <GitHubIcon />
            </IconButton>
          )}
          {project.demoUrl && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                window.open(project.demoUrl, '_blank');
              }}
            >
              <LaunchIcon />
            </IconButton>
          )}
          <IconButton size="small">
            <FavoriteIcon />
          </IconButton>
        </Box>

        {(() => {
          // Show different buttons based on collaboration status
          if (isLoadingStatus) {
            return (
              <Button
                variant="contained"
                size="small"
                disabled
                sx={{
                  bgcolor: 'hsl(220, 85%, 55%)',
                  '&:hover': { bgcolor: 'hsl(220, 85%, 65%)' },
                }}
              >
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Loading...
              </Button>
            );
          }

          if (collaborationStatus?.isOwner) {
            return (
              <Button
                variant="contained"
                size="small"
                disabled
                sx={{
                  bgcolor: 'hsl(120, 20%, 50%)',
                  '&:hover': { bgcolor: 'hsl(120, 20%, 50%)' },
                }}
              >
                Your Project
              </Button>
            );
          }

          if (collaborationStatus?.collaboration?.status === 'pending') {
            return (
              <Button
                variant="contained"
                size="small"
                disabled
                startIcon={<HourglassEmptyIcon />}
                sx={{
                  bgcolor: 'hsl(45, 90%, 60%)',
                  '&:hover': { bgcolor: 'hsl(45, 90%, 60%)' },
                }}
              >
                Invitation Pending
              </Button>
            );
          }

          if (collaborationStatus?.collaboration?.status === 'accepted') {
            return (
              <Button
                variant="contained"
                size="small"
                disabled
                startIcon={<CheckCircleIcon />}
                sx={{
                  bgcolor: 'hsl(140, 70%, 50%)',
                  '&:hover': { bgcolor: 'hsl(140, 70%, 50%)' },
                }}
              >
                Collaborator
              </Button>
            );
          }

          if (collaborationStatus?.collaboration?.status === 'declined') {
            return (
              <Button
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdoptProject();
                }}
                disabled={isAdopting}
                sx={{
                  bgcolor: 'hsl(220, 85%, 55%)',
                  '&:hover': { bgcolor: 'hsl(220, 85%, 65%)' },
                }}
              >
                {isAdopting ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Adopting...
                  </>
                ) : (
                  'Adopt Project'
                )}
              </Button>
            );
          }

          // Default case - no collaboration status or not authenticated
          return (
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (isAuthenticated) {
                  handleAdoptProject();
                } else {
                  // Handle login redirect
                  window.location.href = `${apiBase}/auth/github`;
                }
              }}
              disabled={isAdopting}
              sx={{
                bgcolor: 'hsl(220, 85%, 55%)',
                '&:hover': { bgcolor: 'hsl(220, 85%, 65%)' },
              }}
            >
              {isAdopting ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Adopting...
                </>
              ) : (
                project.status === 'seeking-contributors' ? 'Adopt Project' : 'Join Project'
              )}
            </Button>
          );
        })()}
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
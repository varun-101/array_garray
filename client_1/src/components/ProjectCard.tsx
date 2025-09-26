import React from 'react';
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
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Favorite as FavoriteIcon,
  Group as GroupIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { Project } from '../store/slices/projectsSlice';

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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'seeking-contributors':
        return 'hsl(var(--success))';
      case 'in-progress':
        return 'hsl(var(--warning))';
      case 'completed':
        return 'hsl(var(--accent))';
      case 'paused':
        return 'hsl(var(--muted-foreground))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'hsl(var(--success))';
      case 'intermediate':
        return 'hsl(var(--warning))';
      case 'advanced':
        return 'hsl(var(--destructive))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'var(--transition-smooth)',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-card)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'var(--shadow-elevated)',
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
                bgcolor: project.aiHealthScore > 80 ? 'hsl(var(--success))' : 
                         project.aiHealthScore > 60 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))',
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

        <Button
          variant="contained"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onAdopt?.(project);
          }}
          sx={{
            bgcolor: 'hsl(var(--primary))',
            '&:hover': { bgcolor: 'hsl(var(--primary-hover))' },
          }}
        >
          {project.status === 'seeking-contributors' ? 'Adopt Project' : 'Join Project'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
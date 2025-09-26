import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../hooks/useRedux';
import { addProject } from '../store/slices/projectsSlice';
import Navigation from '../components/Navigation';

const AddProject: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    githubUrl: '',
    demoUrl: '',
    category: '',
    difficulty: '',
    estimatedTime: '',
    techStack: [] as string[],
    tags: [] as string[],
  });

  const [newTech, setNewTech] = useState('');
  const [newTag, setNewTag] = useState('');

  const categories = [
    'Web Development',
    'Mobile Development', 
    'Machine Learning',
    'Data Science',
    'IoT',
    'Game Development',
    'Blockchain',
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTechStack = () => {
    if (newTech.trim() && !formData.techStack.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, newTech.trim()]
      }));
      setNewTech('');
    }
  };

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      techStack: formData.techStack,
      category: formData.category,
      status: 'seeking-contributors' as const,
      author: {
        name: 'Current User', // This would come from auth context
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        university: 'Your University'
      },
      contributors: 1,
      lastUpdated: new Date().toISOString().split('T')[0],
      githubUrl: formData.githubUrl,
      demoUrl: formData.demoUrl,
      tags: formData.tags,
      difficulty: formData.difficulty as 'beginner' | 'intermediate' | 'advanced',
      estimatedTime: formData.estimatedTime,
      aiHealthScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
    };

    dispatch(addProject(newProject));
    navigate('/');
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mb: 2 }}
          >
            Back to Projects
          </Button>
          
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Add New Project
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Share your project with the engineering community
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />

                <TextField
                  fullWidth
                  label="Project Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="GitHub Repository URL"
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    placeholder="https://github.com/username/repo"
                  />

                  <TextField
                    fullWidth
                    label="Demo URL (optional)"
                    value={formData.demoUrl}
                    onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                    placeholder="https://demo.example.com"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category"
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth required>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={formData.difficulty}
                      label="Difficulty"
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    >
                      {difficulties.map((difficulty) => (
                        <MenuItem key={difficulty} value={difficulty}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Estimated Time"
                    value={formData.estimatedTime}
                    onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                    placeholder="e.g., 2-3 weeks"
                    required
                  />
                </Box>

                {/* Tech Stack */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Tech Stack
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      placeholder="Add technology"
                      size="small"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
                    />
                    <Button
                      onClick={addTechStack}
                      variant="outlined"
                      startIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {formData.techStack.map((tech) => (
                      <Chip
                        key={tech}
                        label={tech}
                        onDelete={() => removeTechStack(tech)}
                        deleteIcon={<CloseIcon />}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Tags */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      size="small"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button
                      onClick={addTag}
                      variant="outlined"
                      startIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {formData.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => removeTag(tag)}
                        deleteIcon={<CloseIcon />}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                {/* Demo Images Section */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Project Demo Images
                  </Typography>
                  <Card sx={{ border: '2px dashed hsl(var(--border))', bgcolor: 'hsl(var(--muted))' }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        Upload Demo Images
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Drag and drop images or click to browse
                      </Typography>
                      <Button variant="outlined">
                        Choose Images
                      </Button>
                    </CardContent>
                  </Card>
                </Box>


                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Project Demo Videos
                  </Typography>
                  <Card sx={{ border: '2px dashed hsl(var(--border))', bgcolor: 'hsl(var(--muted))' }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        Upload Demo Videos
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Drag and drop Videos or click to browse
                      </Typography>
                      <Button variant="outlined">
                        Choose Videos
                      </Button>
                    </CardContent>
                  </Card>
                </Box>

                

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!formData.title || !formData.description || !formData.category || !formData.difficulty}
                  >
                    Create Project
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default AddProject;
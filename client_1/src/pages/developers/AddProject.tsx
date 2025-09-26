import React, { useEffect, useState } from 'react';
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
import { useAppDispatch } from '../../hooks/useRedux';
import { addProject } from '../../store/slices/projectsSlice';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { uploadFileToBucket } from '../../lib/appwrite';
import { CircularProgress } from '@mui/material';

interface RepoItem {
  name: string;
  fullName: string;
  description: string;
  url: string;
}

const AddProject: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken } = useAuth();

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
    projectImgUrl: '' as string,
  });

  const [newTech, setNewTech] = useState('');
  const [newTag, setNewTag] = useState('');

  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>('');

  const [imageUploads, setImageUploads] = useState<{ fileId: string; url: string }[]>([]);
  const [videoUploads, setVideoUploads] = useState<{ fileId: string; url: string }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Backend expects: projectName, projectDescription, projectLink, techStack, projectImgUrl, accessToken
    const payload = {
      projectName: formData.title,
      projectDescription: formData.description,
      projectLink: formData.githubUrl,
      techStack: formData.techStack,
      projectImgUrl: formData.projectImgUrl || null,
      projectImgUrls: imageUploads.map(i => i.url),
      projectVideoUrls: videoUploads.map(v => v.url),
      demoUrl: formData.demoUrl || null,
      category: formData.category,
      difficulty: formData.difficulty,
      estimatedTime: formData.estimatedTime,
      tags: formData.tags,
      accessToken: accessToken,
    };

    try {
      const res = await fetch(`${apiBase}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create project');

      // Also keep local store updated for immediate UX
      const localProject: any = {
        id: data?._id || Date.now().toString(),
        title: formData.title,
        description: formData.description,
        techStack: formData.techStack,
        category: formData.category,
        status: 'seeking-contributors' as const,
        author: {
          name: 'Current User',
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
        projectImgUrl: formData.projectImgUrl || undefined,
        projectImgUrls: imageUploads.map(i => i.url),
        projectVideoUrls: videoUploads.map(v => v.url),
        aiHealthScore: Math.floor(Math.random() * 40) + 60,
      };
      dispatch(addProject(localProject));

      navigate('/');
    } catch (err: any) {
      alert(err?.message || 'Failed to create project');
    }
  };

  useEffect(() => {
    const fetchRepos = async () => {
      if (!isAuthenticated || !accessToken) return;
      try {
        setLoadingRepos(true);
        setRepoError(null);
        const res = await fetch(`${apiBase}/github/repos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load repositories');
        setRepos((data.data || []).map((r: any) => ({
          name: r.name,
          fullName: r.fullName,
          description: r.description,
          url: r.url,
        })));
      } catch (e: any) {
        setRepoError(e.message || 'Failed to load repositories');
      } finally {
        setLoadingRepos(false);
      }
    };
    fetchRepos();
  }, [apiBase, isAuthenticated, accessToken]);

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
                {/* Select repository from user's GitHub */}
                <FormControl fullWidth>
                  <InputLabel>Repository</InputLabel>
                  <Select
                    value={selectedRepo}
                    label="Repository"
                    onChange={(e) => {
                      const full = e.target.value as string;
                      setSelectedRepo(full);
                      const repo = repos.find(r => r.fullName === full);
                      if (repo) {
                        setFormData(prev => ({
                          ...prev,
                          title: repo.name,
                          githubUrl: repo.url,
                          description: repo.description || prev.description,
                        }));
                      }
                    }}
                    disabled={loadingRepos}
                  >
                    {loadingRepos && <MenuItem value="" disabled>Loading repositories...</MenuItem>}
                    {!loadingRepos && repoError && (
                      <MenuItem value="" disabled>Error loading repositories</MenuItem>
                    )}
                    {!loadingRepos && !repoError && repos.length === 0 && (
                      <MenuItem value="" disabled>No repositories found</MenuItem>
                    )}
                    {repos.map((repo) => (
                      <MenuItem key={repo.fullName} value={repo.fullName}>
                        {repo.fullName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
                      <input
                        id="imageUploader"
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) return;
                          setUploadingImages(true);
                          try {
                            const uploads = await Promise.all(files.map(f => uploadFileToBucket(f, { kind: 'image', projectSlug: formData.title || 'new-project' })));
                            setImageUploads(prev => [...prev, ...uploads]);
                            // store the first image URL as preview for now
                            setFormData(prev => ({ ...prev, projectImgUrl: uploads[0]?.url || prev.projectImgUrl }));
                          } catch (err: any) {
                            console.error('Image upload failed', err);
                            alert(err?.message || 'Image upload failed');
                          } finally {
                            setUploadingImages(false);
                          }
                        }}
                      />
                      <Button variant="outlined" onClick={() => document.getElementById('imageUploader')?.click()}>
                        Choose Images
                      </Button>
                      {uploadingImages && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                          <CircularProgress size={20} />
                          <Typography variant="body2" color="text.secondary">Uploading images…</Typography>
                        </Box>
                      )}
                      {!uploadingImages && imageUploads.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {imageUploads.length} image{imageUploads.length>1?'s':''} uploaded
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {imageUploads.map((img, idx) => (
                              <Box key={img.fileId + idx} component="img" src={img.url} alt={`upload-${idx}`} sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 1, border: '1px solid hsl(var(--border))' }} />
                            ))}
                          </Box>
                        </Box>
                      )}
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
                      <input
                        id="videoUploader"
                        type="file"
                        accept="video/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) return;
                          setUploadingVideos(true);
                          try {
                            const uploads = await Promise.all(files.map(f => uploadFileToBucket(f, { kind: 'video', projectSlug: formData.title || 'new-project' })));
                            setVideoUploads(prev => [...prev, ...uploads]);
                          } catch (err: any) {
                            console.error('Video upload failed', err);
                            alert(err?.message || 'Video upload failed');
                          } finally {
                            setUploadingVideos(false);
                          }
                        }}
                      />
                      <Button variant="outlined" onClick={() => document.getElementById('videoUploader')?.click()}>
                        Choose Videos
                      </Button>
                      {uploadingVideos && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                          <CircularProgress size={20} />
                          <Typography variant="body2" color="text.secondary">Uploading videos…</Typography>
                        </Box>
                      )}
                      {!uploadingVideos && videoUploads.length > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          {videoUploads.length} video{videoUploads.length>1?'s':''} uploaded
                        </Typography>
                      )}
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
                    disabled={!formData.title || !formData.description || !formData.category}
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
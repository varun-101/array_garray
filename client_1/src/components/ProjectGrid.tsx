/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { setSearchQuery, setCategory, setSortBy, clearFilters } from '../store/slices/filtersSlice';
import ProjectCard from './ProjectCard';

const ProjectGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects } = useAppSelector((state) => state.projects);
  const filters = useAppSelector((state) => state.filters);

  const categories = [
    'All',
    'Web Development',
    'Mobile Development',
    'Machine Learning',
    'Data Science',
    'IoT',
    'Game Development',
    'Blockchain',
  ];

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.techStack.some((tech) => tech.toLowerCase().includes(query)) ||
          project.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter((project) => project.category === filters.category);
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.contributors - a.contributors);
        break;
      case 'health-score':
        filtered.sort((a, b) => b.aiHealthScore - a.aiHealthScore);
        break;
      case 'contributors':
        filtered.sort((a, b) => b.contributors - a.contributors);
        break;
    }

    return filtered;
  }, [projects, filters]);

  const handleProjectAdopt = (project: any) => {
    console.log('Adopting project:', project.title);
    // TODO: Implement project adoption logic
  };

  const handleProjectView = (project: any) => {
    console.log('Viewing project:', project.title);
    // TODO: Implement project detail view
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 2,
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Discover Projects
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Find the perfect project to contribute to or adopt
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => window.location.href = '/add-project'}
          sx={{
            bgcolor: 'hsl(var(--primary))',
            '&:hover': { bgcolor: 'hsl(var(--primary-hover))' },
          }}
        >
          + New Project
        </Button>
      </Box>

      {/* Filters */}
      {/* <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(6, 1fr)',
            },
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Box sx={{ gridColumn: { xs: '1', md: '1 / 3' } }}>
            <TextField
              fullWidth
              placeholder="Search projects, technologies, tags..."
              value={filters.searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
          </Box>
          
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              label="Category"
              onChange={(e) => dispatch(setCategory(e.target.value))}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.slice(1).map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              label="Sort By"
              onChange={(e) => dispatch(setSortBy(e.target.value as any))}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
              <MenuItem value="health-score">AI Health Score</MenuItem>
              <MenuItem value="contributors">Contributors</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => dispatch(clearFilters())}
            fullWidth
          >
            Clear Filters
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Chip
              label={`${filteredProjects.length} projects`}
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
      </Box> */}

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={handleProjectView}
              onAdopt={handleProjectAdopt}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            bgcolor: 'hsl(var(--muted))',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            No projects found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search criteria or clear the filters
          </Typography>
          <Button
            variant="contained"
            onClick={() => dispatch(clearFilters())}
          >
            Clear All Filters
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ProjectGrid;
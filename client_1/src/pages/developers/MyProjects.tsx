import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Button,
  Container,
  Divider,
} from '@mui/material';
// using Box-based CSS grid for compatibility
import { GitHub as GitHubIcon, Launch as LaunchIcon, Refresh as RefreshIcon, FolderOpen as FolderOpenIcon } from '@mui/icons-material';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

interface RepoItem {
  name: string;
  fullName: string;
  description: string;
  private: boolean;
  url: string;
  cloneUrl: string;
  language: string;
  stars: number;
  forks: number;
  lastUpdated: string;
}

const MyProjects: React.FC = () => {
  const { user, isAuthenticated, accessToken } = useAuth();
  const [repos, setRepos] = React.useState<RepoItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

  React.useEffect(() => {
    const fetchRepos = async () => {
      if (!isAuthenticated || !user?.githubId) return;
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${apiBase}/github/repos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data?.error || 'Failed to load projects');
        setRepos(data.data || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, [apiBase, isAuthenticated, user?.githubId]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />

      {/* Header section with gradient background to match hero */}
      <Box
        sx={{
          background: 'var(--gradient-hero)',
          py: { xs: 6, md: 10 },
          borderBottom: '1px solid rgba(255,255,255,0.25)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                My Projects
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Discover and manage your repositories powered by GitHub
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              sx={{ bgcolor: 'white', color: 'hsl(var(--primary))', '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' } }}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid hsl(var(--border))',
            boxShadow: 'var(--shadow-card)',
            p: { xs: 2, md: 3 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Owned Projects
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          )}

          {loading ? (
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Box key={i}>
                  <Card sx={{ p: 2 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
                  </Card>
                </Box>
              ))}
            </Box>
          ) : repos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <FolderOpenIcon sx={{ fontSize: 48, color: 'hsl(var(--accent))' }} />
              <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 700 }}>
                No repositories found
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Connect your GitHub account or create a new project to get started.
              </Typography>
              <Button variant="contained">Submit Project</Button>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
              {repos.map((repo) => (
                <Box key={repo.fullName}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'var(--transition-smooth)',
                      boxShadow: 'var(--shadow-card)'
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar src={user?.avatar} alt={user?.name || user?.username} sx={{ width: 28, height: 28 }} />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {repo.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {repo.fullName}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {repo.description || 'No description provided.'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {repo.language && <Chip size="small" label={repo.language} variant="outlined" />}
                        <Chip size="small" label={`${repo.stars} ★`} variant="outlined" />
                        <Chip size="small" label={`${repo.forks} Forks`} variant="outlined" />
                        <Chip size="small" label={repo.private ? 'Private' : 'Public'} color={repo.private ? 'default' : 'success'} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Updated {repo.lastUpdated ? new Date(repo.lastUpdated).toLocaleDateString() : '—'}
                      </Typography>
                    </CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Tooltip title="Open on GitHub">
                        <IconButton onClick={() => window.open(repo.url, '_blank')}>
                          <GitHubIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy clone URL">
                        <IconButton onClick={() => navigator.clipboard.writeText(repo.cloneUrl)}>
                          <LaunchIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Adopted Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coming soon.
          </Typography>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default MyProjects;



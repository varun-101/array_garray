import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Fade,
  Slide,
  Zoom,
  Collapse,
  Divider,
  Grid,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  CircularProgress,
  Backdrop
} from '@mui/material';
import {
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Description as DescriptionIcon,
  Build as BuildIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as AccessTimeIcon,
  Storage as StorageIcon,
  GitHub as GitHubIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface ImplementationRecord {
  id: string;
  implementationId: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  projectName: string;
  repoUrl: string;
  techStack: string[];
  codeGeneration: {
    success: boolean;
    branchName?: string;
    commitHash?: string;
    modifiedFiles?: string[];
    error?: string;
    generatedAt?: string;
  };
  pullRequest: {
    success: boolean;
    url?: string;
    number?: number;
    state?: string;
    error?: string;
    createdAt?: string;
  };
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  durationFormatted?: string;
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'success';
    message: string;
    details?: any;
  }>;
  metrics: {
    filesProcessed: number;
    linesAdded: number;
    linesRemoved: number;
    testCoverage: number;
  };
  error?: {
    message: string;
    stack?: string;
    occurredAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ImplementationHistoryProps {
  projectName?: string;
  repoUrl?: string;
  onRefresh?: () => void;
  showStatistics?: boolean;
  compact?: boolean;
}

const ImplementationHistory: React.FC<ImplementationHistoryProps> = ({
  projectName,
  repoUrl,
  onRefresh,
  showStatistics = true,
  compact = false
}) => {
  const [implementations, setImplementations] = useState<ImplementationRecord[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<{
    status?: string;
    category?: string;
    timeRange?: string;
  }>({});
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    hasMore: false,
    total: 0
  });

  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

  const fetchImplementations = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPagination(prev => ({ ...prev, offset: 0 }));
      } else {
        setRefreshing(true);
      }

      const params = new URLSearchParams();
      if (projectName) params.append('projectName', projectName);
      if (repoUrl) params.append('repoUrl', repoUrl);
      if (filter.status) params.append('status', filter.status);
      params.append('limit', pagination.limit.toString());
      params.append('offset', reset ? '0' : pagination.offset.toString());

      const response = await fetch(`${apiBase}/api/implementation/history?${params}`);
      const data = await response.json();

      if (data.success) {
        if (reset) {
          setImplementations(data.implementations);
        } else {
          setImplementations(prev => [...prev, ...data.implementations]);
        }
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch implementation history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch implementation history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams();
      if (projectName) params.append('projectName', projectName);
      if (repoUrl) params.append('repoUrl', repoUrl);
      if (filter.timeRange) params.append('timeRange', filter.timeRange);

      const response = await fetch(`${apiBase}/api/implementation/statistics?${params}`);
      const data = await response.json();

      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (err) {
      console.warn('Failed to fetch statistics:', err);
    }
  };

  useEffect(() => {
    fetchImplementations(true);
    if (showStatistics) {
      fetchStatistics();
    }
  }, [projectName, repoUrl, filter]);

  const handleRefresh = () => {
    fetchImplementations(true);
    if (showStatistics) {
      fetchStatistics();
    }
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleLoadMore = () => {
    fetchImplementations(false);
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'processing': return 'warning';
      case 'pending': return 'info';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'failed': return <ErrorIcon />;
      case 'processing': return <CircularProgress size={16} />;
      case 'pending': return <ScheduleIcon />;
      case 'cancelled': return <ErrorIcon />;
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
      case 'DevOps': return <BuildIcon />;
      case 'Feature': return <BuildIcon />;
      default: return <CodeIcon />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderStatistics = () => {
    if (!statistics || !showStatistics) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AssessmentIcon sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Implementation Statistics
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {statistics.total}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Implementations
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#4caf50' }}>
                    {statistics.successRate}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Success Rate
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#ff9800' }}>
                    {statistics.averageDuration ? Math.round(statistics.averageDuration / 1000 / 60) : 0}m
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Avg Duration
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#2196f3' }}>
                    {statistics.totalFilesProcessed}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Files Processed
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderImplementationCard = (implementation: ImplementationRecord, index: number) => {
    const isExpanded = expandedItems.has(implementation.id);
    const isProcessing = implementation.status === 'processing';

    return (
      <motion.div
        key={implementation.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        layout
      >
        <Card 
          sx={{ 
            mb: 2, 
            border: isExpanded ? 2 : 1,
            borderColor: isExpanded ? 'primary.main' : 'divider',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)'
            }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {getCategoryIcon(implementation.category)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {implementation.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {implementation.description}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip 
                    icon={getStatusIcon(implementation.status)}
                    label={implementation.status.toUpperCase()}
                    color={getStatusColor(implementation.status) as any}
                    size="small"
                    variant="filled"
                  />
                  <Chip 
                    label={implementation.category}
                    size="small"
                    variant="outlined"
                    icon={getCategoryIcon(implementation.category)}
                  />
                  <Chip 
                    label={implementation.difficulty}
                    color={getDifficultyColor(implementation.difficulty) as any}
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    label={implementation.priority}
                    color={getPriorityColor(implementation.priority) as any}
                    size="small"
                    variant="outlined"
                  />
                  {implementation.durationFormatted && (
                    <Chip 
                      icon={<AccessTimeIcon />}
                      label={implementation.durationFormatted}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                {isProcessing && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        Progress: {implementation.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={implementation.progress} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Project:</strong> {implementation.projectName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Started:</strong> {formatDate(implementation.createdAt)}
                  </Typography>
                  {implementation.completedAt && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Completed:</strong> {formatDate(implementation.completedAt)}
                    </Typography>
                  )}
                </Box>

                {implementation.codeGeneration.success && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {implementation.codeGeneration.branchName && (
                      <Chip 
                        icon={<GitHubIcon />}
                        label={`Branch: ${implementation.codeGeneration.branchName}`}
                        size="small"
                        variant="outlined"
                        color="success"
                      />
                    )}
                    {implementation.pullRequest.success && implementation.pullRequest.url && (
                      <Chip 
                        icon={<OpenInNewIcon />}
                        label={`PR #${implementation.pullRequest.number}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                        clickable
                        onClick={() => window.open(implementation.pullRequest.url, '_blank')}
                      />
                    )}
                  </Box>
                )}

                {implementation.error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Error:</strong> {implementation.error.message}
                    </Typography>
                  </Alert>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <IconButton 
                  onClick={() => toggleExpanded(implementation.id)}
                  color="primary"
                  size="small"
                >
                  <ExpandMoreIcon 
                    sx={{ 
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }} 
                  />
                </IconButton>
                
                {implementation.pullRequest.success && implementation.pullRequest.url && (
                  <Tooltip title="View Pull Request">
                    <IconButton 
                      size="small"
                      onClick={() => window.open(implementation.pullRequest.url, '_blank')}
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Implementation Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Tech Stack:</strong> {implementation.techStack.join(', ')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Files Modified:</strong> {implementation.codeGeneration.modifiedFiles?.length || 0}
                    </Typography>
                  </Grid>
                  {implementation.metrics.filesProcessed > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Lines Added:</strong> {implementation.metrics.linesAdded}
                      </Typography>
                    </Grid>
                  )}
                  {implementation.metrics.linesRemoved > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Lines Removed:</strong> {implementation.metrics.linesRemoved}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {implementation.logs.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Implementation Logs
                  </Typography>
                  <List dense>
                    {implementation.logs.slice(-5).map((log, logIndex) => (
                      <ListItem key={logIndex} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {log.level === 'success' && <CheckCircleIcon color="success" fontSize="small" />}
                          {log.level === 'error' && <ErrorIcon color="error" fontSize="small" />}
                          {log.level === 'warn' && <ErrorIcon color="warning" fontSize="small" />}
                          {log.level === 'info' && <TimelineIcon color="info" fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={log.message}
                          secondary={formatDate(log.timestamp)}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Collapse>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Implementation History
        </Typography>
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Implementation History
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton 
              onClick={handleRefresh}
              disabled={refreshing}
              color="primary"
            >
              <RefreshIcon sx={{ 
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderStatistics()}

      <AnimatePresence>
        {implementations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No Implementation History Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {projectName ? `No implementations found for project "${projectName}"` : 'No implementations found'}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Box>
            {implementations.map((implementation, index) => 
              renderImplementationCard(implementation, index)
            )}
            
            {pagination.hasMore && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleLoadMore}
                  disabled={refreshing}
                  startIcon={refreshing ? <CircularProgress size={16} /> : <DownloadIcon />}
                >
                  Load More
                </Button>
              </Box>
            )}
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default ImplementationHistory;

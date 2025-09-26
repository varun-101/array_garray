import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Divider,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  BugReport as BugReportIcon,
  Star as StarIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Update as UpdateIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface AISummaryProps {
  projectName: string;
  techStack: string[];
  difficulty: string;
  category: string;
  repoUrl?: string;
  projectId?: string;
  onAnalysisUpdate?: (analysis: any) => void;
}

const AISummary: React.FC<AISummaryProps> = ({ 
  projectName, 
  techStack, 
  difficulty, 
  category,
  repoUrl,
  projectId,
  onAnalysisUpdate
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

  const generateAnalysis = async () => {
    if (!repoUrl) {
      setError("Repository URL is required for AI analysis");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiBase}/api/ai/analyze${projectId ? `/${projectId}` : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl,
          projectName,
          techStack,
          difficulty,
          category
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to generate analysis');
      }

      const data = await response.json();
      setAiAnalysis(data.analysis);
      setCacheInfo({
        cached: data.cached,
        cacheStatus: data.cacheStatus,
        commitHash: data.commitHash,
        analysisDate: data.analysisDate,
        comparison: data.comparison
      });
      setHasAnalyzed(true);
      
      // Notify parent component of analysis update
      if (onAnalysisUpdate) {
        onAnalysisUpdate(data.analysis);
      }
      
      // Load history if this is a cached result
      if (data.cached && repoUrl) {
        loadAnalysisHistory();
      }
    } catch (err: any) {
      console.error('Error generating AI analysis:', err);
      setError(err.message || 'Failed to generate AI analysis');
      
      // Fallback to dummy data if API fails
      const fallbackAnalysis = getFallbackAnalysis();
      setAiAnalysis(fallbackAnalysis);
      setHasAnalyzed(true);
      
      // Notify parent component of fallback analysis
      if (onAnalysisUpdate) {
        onAnalysisUpdate(fallbackAnalysis);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFallbackAnalysis = () => ({
    overallScore: 75,
    codeQuality: 78,
    maintainability: 82,
    security: 90,
    performance: 75,
    documentation: 70,
    recommendations: [
      "Consider adding more comprehensive error handling",
      "Implement automated testing to improve code coverage",
      "Add API documentation for better developer experience",
      "Consider implementing caching for better performance",
      "Add input validation for enhanced security"
    ],
    strengths: [
      `Well-organized project structure suitable for ${category} applications`,
      `Good choice of technology stack with ${techStack.join(', ')}`,
      `Project scope is appropriate for ${difficulty} level developers`,
      "Clear project setup and basic functionality implementation",
      "Follows standard conventions for the chosen technology stack"
    ],
    improvements: [
      "Increase test coverage to ensure code reliability",
      "Add performance monitoring and optimization",
      "Implement comprehensive error handling and logging",
      "Enhance documentation with examples and API references",
      "Consider adding accessibility features for better user experience"
    ],
    techStackAnalysis: {
      modern: techStack.filter(tech => 
        ['React', 'Vue', 'Angular', 'TypeScript', 'Next.js', 'Nuxt.js', 'Svelte'].includes(tech)
      ),
      stable: techStack.filter(tech => 
        ['JavaScript', 'HTML', 'CSS', 'Node.js', 'Python', 'Java', 'PHP'].includes(tech)
      ),
      emerging: techStack.filter(tech => 
        ['Deno', 'Bun', 'WebAssembly', 'Rust', 'Go', 'Zig'].includes(tech)
      )
    }
  });

  const loadAnalysisHistory = async () => {
    if (!repoUrl) return;
    
    try {
      const response = await fetch(`${apiBase}/api/ai/history?repoUrl=${encodeURIComponent(repoUrl)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisHistory(data.history || []);
      }
    } catch (error) {
      console.warn('Failed to load analysis history:', error);
    }
  };

  const checkForCachedAnalysis = async () => {
    if (!repoUrl) return;
    
    try {
      const response = await fetch(`${apiBase}/api/ai/analysis/cached?repoUrl=${encodeURIComponent(repoUrl)}`);
      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data.analysis);
        setCacheInfo({
          cached: true,
          cacheStatus: data.metadata.cacheStatus || 'valid',
          commitHash: data.metadata.commitHash,
          analysisDate: data.metadata.analysisDate,
          comparison: data.comparison
        });
        setHasAnalyzed(true);
        loadAnalysisHistory();
        
        // Notify parent component of cached analysis
        if (onAnalysisUpdate) {
          onAnalysisUpdate(data.analysis);
        }
      }
    } catch (error) {
      console.warn('No cached analysis found:', error);
    }
  };

  useEffect(() => {
    // Check for cached analysis first, then auto-generate if needed
    if (repoUrl && !hasAnalyzed) {
      checkForCachedAnalysis().then(() => {
        // Only generate new analysis if no cached version found
        if (!hasAnalyzed) {
          generateAnalysis();
        }
      });
    }
  }, [repoUrl]);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Analyzing Repository...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Our AI is downloading and analyzing the code structure, quality, and architecture.
          <br />
          This may take a few moments.
        </Typography>
      </Box>
    );
  }

  // Show generate button if no analysis yet
  if (!aiAnalysis && !loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          AI Code Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Get detailed insights about code quality, architecture, security, and performance.
        </Typography>
        
        {error && (
          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            <AlertTitle>Analysis Failed</AlertTitle>
            {error}
            <br />
            <small>Showing fallback analysis based on project information.</small>
          </Alert>
        )}
        
        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} /> : <StarIcon />}
          onClick={generateAnalysis}
          disabled={loading || !repoUrl}
          sx={{ minWidth: 200 }}
        >
          {loading ? 'Analyzing...' : 'Generate AI Analysis'}
        </Button>
        
        {!repoUrl && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
            Repository URL is required for AI analysis
          </Typography>
        )}
      </Box>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <Box>
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Analysis Notice</AlertTitle>
          {error}
          <br />
          <small>Showing fallback analysis based on project information.</small>
        </Alert>
      )}
      
      {/* Overall Score */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                AI Project Analysis
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {analysisHistory.length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<HistoryIcon />}
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? 'Hide History' : 'Show History'}
                </Button>
              )}
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={generateAnalysis}
                disabled={loading || !repoUrl}
              >
                Refresh Analysis
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {aiAnalysis.overallScore}/100
            </Typography>
            <Chip 
              label={getScoreLabel(aiAnalysis.overallScore)} 
              color={getScoreColor(aiAnalysis.overallScore) as any}
              variant="filled"
            />
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={aiAnalysis.overallScore} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          
          {/* Cache Status */}
          {cacheInfo && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={cacheInfo.cached ? <CheckCircleIcon /> : <UpdateIcon />}
                label={cacheInfo.cached ? 'From Cache' : 'Freshly Generated'}
                color={cacheInfo.cached ? 'success' : 'primary'}
                variant="outlined"
                size="small"
              />
              {cacheInfo.commitHash && (
                <Chip
                  icon={<CodeIcon />}
                  label={`Commit: ${cacheInfo.commitHash.substring(0, 8)}`}
                  variant="outlined"
                  size="small"
                />
              )}
              {cacheInfo.analysisDate && (
                <Chip
                  icon={<ScheduleIcon />}
                  label={`${new Date(cacheInfo.analysisDate).toLocaleDateString()}`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          )}
          
          {/* Comparison with previous analysis */}
          {cacheInfo?.comparison && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <AlertTitle>Analysis Comparison</AlertTitle>
              {cacheInfo.comparison}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Detailed Metrics
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CodeIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">Code Quality</Typography>
              </Box>
              <LinearProgress variant="determinate" value={aiAnalysis.codeQuality} />
              <Typography variant="caption" color="text.secondary">
                {aiAnalysis.codeQuality}/100
              </Typography>
            </Box>
            
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">Maintainability</Typography>
              </Box>
              <LinearProgress variant="determinate" value={aiAnalysis.maintainability} />
              <Typography variant="caption" color="text.secondary">
                {aiAnalysis.maintainability}/100
              </Typography>
            </Box>
            
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SecurityIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">Security</Typography>
              </Box>
              <LinearProgress variant="determinate" value={aiAnalysis.security} />
              <Typography variant="caption" color="text.secondary">
                {aiAnalysis.security}/100
              </Typography>
            </Box>
            
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SpeedIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">Performance</Typography>
              </Box>
              <LinearProgress variant="determinate" value={aiAnalysis.performance} />
              <Typography variant="caption" color="text.secondary">
                {aiAnalysis.performance}/100
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tech Stack Analysis */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Technology Stack Analysis
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Box>
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>
                Modern Technologies
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {aiAnalysis.techStackAnalysis.modern.map((tech, index) => (
                  <Chip key={index} label={tech} size="small" color="success" variant="outlined" />
                ))}
              </Box>
            </Box>
            
            <Box>
              <Typography variant="body2" color="info.main" sx={{ fontWeight: 600, mb: 1 }}>
                Stable Technologies
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {aiAnalysis.techStackAnalysis.stable.map((tech, index) => (
                  <Chip key={index} label={tech} size="small" color="info" variant="outlined" />
                ))}
              </Box>
            </Box>
            
            <Box>
              <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600, mb: 1 }}>
                Emerging Technologies
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {aiAnalysis.techStackAnalysis.emerging.map((tech, index) => (
                  <Chip key={index} label={tech} size="small" color="warning" variant="outlined" />
                ))}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Strengths and Improvements */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Strengths */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
              Project Strengths
            </Typography>
            <List dense>
              {aiAnalysis.strengths.map((strength, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText 
                    primary={strength}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'warning.main' }}>
              Areas for Improvement
            </Typography>
            <List dense>
              {aiAnalysis.improvements.map((improvement, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText 
                    primary={improvement}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Recommendations */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BugReportIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              AI Recommendations
            </Typography>
          </Box>
          
          <List>
            {aiAnalysis.recommendations.map((recommendation, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemText 
                  primary={`${index + 1}. ${recommendation}`}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      
      {/* Analysis History */}
      {showHistory && analysisHistory.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Analysis History
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Previous analyses for this repository
            </Typography>
            
            <List>
              {analysisHistory.map((history, index) => (
                <ListItem key={history.id} sx={{ px: 0, py: 1 }}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {new Date(history.analysisDate).toLocaleDateString()}
                        </Typography>
                        {history.isLatest && (
                          <Chip label="Latest" color="primary" size="small" />
                        )}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {history.scores.overall}/100
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip 
                        label={`Code: ${history.scores.codeQuality}`} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`Security: ${history.scores.security}`} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`Performance: ${history.scores.performance}`} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      Commit: {history.commitHash.substring(0, 8)} • Model: {history.aiModel}
                      {history.tokensUsed && ` • ${history.tokensUsed} tokens`}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AISummary;

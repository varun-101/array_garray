import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  Fade,
  Slide,
  Zoom,
  Backdrop,
  CircularProgress,
  LinearProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Code as CodeIcon,
  Build as BuildIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Schedule as ScheduleIcon,
  StarBorder as StarBorderIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  GitHub as GitHubIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Description as DescriptionIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  RateReview as RateReviewIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Star as StarIcon,
  AutoFixHigh as AutoFixHighIcon,
  CloudUpload as CloudUploadIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ImplementationHistory from './ImplementationHistory';
import ImplementationLoader from './ImplementationLoader';

interface ImplementationItem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
}

interface CodeImplementationsProps {
  aiAnalysis?: any;
  projectName: string;
  techStack: string[];
  repoUrl?: string;
  projectId?: string;
  onImplementationStart?: (implementationIds: string[]) => void;
  onGeneratePlan?: (implementationIds: string[]) => void;
  onViewExamples?: (implementationId: string) => void;
  showHistory?: boolean;
}

const CodeImplementations: React.FC<CodeImplementationsProps> = ({
  aiAnalysis,
  projectName,
  techStack,
  repoUrl,
  projectId,
  onImplementationStart,
  onGeneratePlan,
  onViewExamples,
  showHistory = true
}) => {
  const [selectedImplementations, setSelectedImplementations] = useState<string[]>([]);
  const [isImplementing, setIsImplementing] = useState(false);
  const [implementationStatus, setImplementationStatus] = useState<{ [key: string]: 'pending' | 'processing' | 'completed' | 'failed' }>({});
  const [activeTab, setActiveTab] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const [loaderSteps, setLoaderSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [recentImplementations, setRecentImplementations] = useState<any[]>([]);
  const [mentorFeedback, setMentorFeedback] = useState<any[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isSubmittingCustomPrompt, setIsSubmittingCustomPrompt] = useState(false);
  const [showCustomPromptDialog, setShowCustomPromptDialog] = useState(false);
  
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

  // Fetch recent implementations
  const fetchRecentImplementations = async () => {
    if (!repoUrl) return;
    
    try {
      const response = await fetch(`${apiBase}/api/implementation/history?repoUrl=${encodeURIComponent(repoUrl)}&limit=5`);
      const data = await response.json();
      
      if (data.success) {
        setRecentImplementations(data.implementations);
      }
    } catch (error) {
      console.warn('Failed to fetch recent implementations:', error);
    }
  };

  // Fetch mentor feedback
  const fetchMentorFeedback = async () => {
    if (!projectId) return;
    
    try {
      const response = await fetch(`${apiBase}/api/projects/${projectId}`);
      const data = await response.json();
      
      if (data.feedback && Array.isArray(data.feedback)) {
        setMentorFeedback(data.feedback);
      }
    } catch (error) {
      console.warn('Failed to fetch mentor feedback:', error);
    }
  };

  // Show snackbar notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Initialize loader steps
  const initializeLoaderSteps = (implementationTitle: string) => {
    const steps = [
      {
        id: 'workspace',
        title: 'Initializing Workspace',
        description: 'Setting up the development environment and cloning repository',
        status: 'pending' as const,
        icon: <GitHubIcon />,
        progress: 0
      },
      {
        id: 'config',
        title: 'Configuring AI Service',
        description: 'Setting up Gemini AI configuration and context',
        status: 'pending' as const,
        icon: <CodeIcon />,
        progress: 0
      },
      {
        id: 'generation',
        title: 'Generating Code',
        description: 'AI is analyzing and generating the implementation code',
        status: 'pending' as const,
        icon: <BuildIcon />,
        progress: 0
      },
      {
        id: 'pr',
        title: 'Creating Pull Request',
        description: 'Creating GitHub pull request with the generated changes',
        status: 'pending' as const,
        icon: <OpenInNewIcon />,
        progress: 0
      }
    ];
    
    setLoaderSteps(steps);
    setCurrentStep(0);
    setOverallProgress(0);
    setShowLoader(true);
  };

  // Update loader step
  const updateLoaderStep = (stepId: string, status: 'processing' | 'completed' | 'failed', progress?: number) => {
    setLoaderSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, progress: progress || (status === 'completed' ? 100 : 0) }
        : step
    ));
    
    if (status === 'completed') {
      setCurrentStep(prev => prev + 1);
      setOverallProgress(prev => Math.min(prev + 25, 100));
    }
  };

  // Close loader
  const closeLoader = () => {
    setShowLoader(false);
    setLoaderSteps([]);
    setCurrentStep(0);
    setOverallProgress(0);
  };

  useEffect(() => {
    if (showHistory && repoUrl) {
      fetchRecentImplementations();
    }
    if (projectId) {
      fetchMentorFeedback();
    }
  }, [repoUrl, showHistory, projectId]);

  // Convert AI recommendations to implementable actions
  const getImplementationSuggestions = () => {
    if (!aiAnalysis) {
      return {
        bugFixes: [
          {
            id: 'error-handling',
            title: 'Implement Comprehensive Error Handling',
            description: 'Add try-catch blocks and proper error boundaries to handle runtime errors gracefully.',
            difficulty: 'Intermediate' as const,
            estimatedTime: '2-3 hours',
            priority: 'High' as const,
            category: 'Quality'
          },
          {
            id: 'input-validation',
            title: 'Add Input Validation',
            description: 'Implement client and server-side validation to prevent security vulnerabilities.',
            difficulty: 'Beginner' as const,
            estimatedTime: '1-2 hours',
            priority: 'High' as const,
            category: 'Security'
          }
        ],
        features: [
          {
            id: 'testing-framework',
            title: 'Add Automated Testing',
            description: 'Implement unit tests, integration tests, and end-to-end testing for better reliability.',
            difficulty: 'Intermediate' as const,
            estimatedTime: '4-6 hours',
            priority: 'Medium' as const,
            category: 'Testing'
          }
        ]
      };
    }

    // Convert AI recommendations to structured implementation items
    const bugFixes = aiAnalysis.recommendations?.slice(0, 3).map((rec: string, index: number) => ({
      id: `ai-fix-${index}`,
      title: rec.replace(/^\d+\.\s*/, ''), // Remove numbering
      description: `Based on AI analysis: ${rec}`,
      difficulty: aiAnalysis.codeQuality > 80 ? 'Beginner' : aiAnalysis.codeQuality > 60 ? 'Intermediate' : 'Advanced',
      estimatedTime: index === 0 ? '2-3 hours' : index === 1 ? '1-2 hours' : '3-4 hours',
      priority: index < 2 ? 'High' : 'Medium',
      category: index === 0 ? 'Quality' : index === 1 ? 'Security' : 'Performance'
    })) || [];

    const features = aiAnalysis.improvements?.slice(0, 4).map((imp: string, index: number) => ({
      id: `ai-feature-${index}`,
      title: imp.replace(/^[-•]\s*/, ''), // Remove bullet points
      description: `Enhancement suggestion: ${imp}`,
      difficulty: index < 2 ? 'Intermediate' : 'Advanced',
      estimatedTime: `${3 + index}-${5 + index} hours`,
      priority: index === 0 ? 'High' : 'Medium',
      category: index === 0 ? 'Testing' : index === 1 ? 'Performance' : index === 2 ? 'Documentation' : 'DevOps'
    })) || [];

    return { bugFixes, features };
  };

  const handleImplementationToggle = (implementationId: string) => {
    setSelectedImplementations(prev => 
      prev.includes(implementationId) 
        ? prev.filter(id => id !== implementationId)
        : [...prev, implementationId]
    );
  };

  const handleStartImplementation = async (implementationId: string) => {
    if (!repoUrl) {
      showNotification('Repository URL is required for implementation', 'error');
      return;
    }

    setImplementationStatus(prev => ({ ...prev, [implementationId]: 'processing' }));
    
    try {
      const { bugFixes, features } = getImplementationSuggestions();
      const allImplementations = [...bugFixes, ...features];
      const implementation = allImplementations.find(impl => impl.id === implementationId);
      
      if (!implementation) {
        throw new Error('Implementation not found');
      }

      // Initialize loader
      initializeLoaderSteps(implementation.title);

      // Step 1: Workspace initialization
      updateLoaderStep('workspace', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate workspace setup
      updateLoaderStep('workspace', 'completed');

      // Step 2: AI configuration
      updateLoaderStep('config', 'processing');
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate config setup
      updateLoaderStep('config', 'completed');

      // Step 3: Code generation
      updateLoaderStep('generation', 'processing');
      
      const response = await fetch(`${apiBase}/api/implementation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          projectName,
          techStack,
          implementation,
          analysisData: aiAnalysis
        })
      });

      const result = await response.json();
      
      if (result.success) {
        updateLoaderStep('generation', 'completed');
        setImplementationStatus(prev => ({ ...prev, [implementationId]: 'completed' }));
        
        // Step 4: Pull request creation
        if (result.pullRequest?.success) {
          updateLoaderStep('pr', 'processing');
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate PR creation
          updateLoaderStep('pr', 'completed');
        } else {
          updateLoaderStep('pr', 'failed');
        }
        
        // Check for deployment (regardless of PR status)
        if (result.deployment?.success) {
          const deploymentMessage = result.deployment.cached 
            ? `Implementation successful! Using existing deployment: ${result.deployment.deploymentUrl}`
            : result.pullRequest?.success 
              ? `Implementation successful! Pull request created and deployed: ${result.deployment.deploymentUrl}`
              : `Implementation successful! Branch deployed: ${result.deployment.deploymentUrl}`;
          showNotification(deploymentMessage, 'success');
        } else if (result.pullRequest?.success) {
          showNotification(`Implementation successful! Pull request created: ${result.pullRequest.url}`, 'success');
        } else {
          showNotification(`Implementation completed! Branch: ${result.codeGeneration.branchName}`, 'success');
        }
        
        if (onImplementationStart) {
          onImplementationStart([implementationId]);
        }
        
        // Refresh recent implementations
        fetchRecentImplementations();
        
        // Close loader after a delay
        setTimeout(() => {
          closeLoader();
        }, 2000);
      } else {
        updateLoaderStep('generation', 'failed');
        setImplementationStatus(prev => ({ ...prev, [implementationId]: 'failed' }));
        showNotification(`Implementation failed: ${result.error || 'Unknown error'}`, 'error');
        
        setTimeout(() => {
          closeLoader();
        }, 2000);
      }
    } catch (error) {
      updateLoaderStep('generation', 'failed');
      setImplementationStatus(prev => ({ ...prev, [implementationId]: 'failed' }));
      console.error('Implementation failed:', error);
      showNotification(`Implementation failed: ${error.message}`, 'error');
      
      setTimeout(() => {
        closeLoader();
      }, 2000);
    }
  };

  const handleViewExamples = (implementationId: string) => {
    if (onViewExamples) {
      onViewExamples(implementationId);
    } else {
      alert(`Showing code examples for: ${implementationId}`);
    }
  };

  // Handle custom prompt submission
  const handleCustomPromptSubmit = async () => {
    if (!customPrompt.trim() || !repoUrl) {
      showNotification('Please enter a custom prompt and ensure repository URL is available', 'warning');
      return;
    }

    setIsSubmittingCustomPrompt(true);
    
    try {
      const customImplementation = {
        id: `custom-${Date.now()}`,
        title: 'Custom Implementation',
        description: customPrompt,
        difficulty: 'Intermediate',
        estimatedTime: '2-4 hours',
        priority: 'Medium',
        category: 'Custom'
      };

      // Initialize loader
      initializeLoaderSteps('Custom Implementation');

      // Step 1: Workspace initialization
      updateLoaderStep('workspace', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateLoaderStep('workspace', 'completed');

      // Step 2: AI configuration
      updateLoaderStep('config', 'processing');
      await new Promise(resolve => setTimeout(resolve, 800));
      updateLoaderStep('config', 'completed');

      // Step 3: Code generation with custom prompt
      updateLoaderStep('generation', 'processing');
      
      const response = await fetch(`${apiBase}/api/implementation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          projectName,
          techStack,
          implementation: customImplementation,
          analysisData: aiAnalysis,
          customPrompt: customPrompt
        })
      });

      const result = await response.json();
      
      if (result.success) {
        updateLoaderStep('generation', 'completed');
        
        // Step 4: Pull request creation
        if (result.pullRequest?.success) {
          updateLoaderStep('pr', 'processing');
          await new Promise(resolve => setTimeout(resolve, 500));
          updateLoaderStep('pr', 'completed');
        } else {
          updateLoaderStep('pr', 'failed');
        }
        
        // Check for deployment (regardless of PR status)
        if (result.deployment?.success) {
          const deploymentMessage = result.deployment.cached 
            ? `Custom implementation successful! Using existing deployment: ${result.deployment.deploymentUrl}`
            : result.pullRequest?.success 
              ? `Custom implementation successful! Pull request created and deployed: ${result.deployment.deploymentUrl}`
              : `Custom implementation successful! Branch deployed: ${result.deployment.deploymentUrl}`;
          showNotification(deploymentMessage, 'success');
        } else if (result.pullRequest?.success) {
          showNotification(`Custom implementation successful! Pull request created: ${result.pullRequest.url}`, 'success');
        } else {
          showNotification(`Custom implementation completed! Branch: ${result.codeGeneration.branchName}`, 'success');
        }
        
        if (onImplementationStart) {
          onImplementationStart([customImplementation.id]);
        }
        
        // Refresh recent implementations
        fetchRecentImplementations();
        
        // Clear custom prompt and close dialog
        setCustomPrompt('');
        setShowCustomPromptDialog(false);
        
        // Close loader after a delay
        setTimeout(() => {
          closeLoader();
        }, 2000);
      } else {
        updateLoaderStep('generation', 'failed');
        showNotification(`Custom implementation failed: ${result.error || 'Unknown error'}`, 'error');
        
        setTimeout(() => {
          closeLoader();
        }, 2000);
      }
    } catch (error) {
      updateLoaderStep('generation', 'failed');
      console.error('Custom implementation failed:', error);
      showNotification(`Custom implementation failed: ${error.message}`, 'error');
      
      setTimeout(() => {
        closeLoader();
      }, 2000);
    } finally {
      setIsSubmittingCustomPrompt(false);
    }
  };

  // Handle mentor feedback implementation
  const handleMentorFeedbackImplementation = async (feedback: any) => {
    if (!repoUrl) {
      showNotification('Repository URL is required for implementation', 'error');
      return;
    }

    const mentorImplementation = {
      id: `mentor-${feedback._id}`,
      title: `Mentor Feedback: ${feedback.mentor?.name || 'Anonymous'}`,
      description: feedback.feedbackText,
      difficulty: 'Intermediate',
      estimatedTime: '2-3 hours',
      priority: 'High',
      category: 'Mentor Feedback'
    };

    // Initialize loader
    initializeLoaderSteps(mentorImplementation.title);

    // Step 1: Workspace initialization
    updateLoaderStep('workspace', 'processing');
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateLoaderStep('workspace', 'completed');

    // Step 2: AI configuration
    updateLoaderStep('config', 'processing');
    await new Promise(resolve => setTimeout(resolve, 800));
    updateLoaderStep('config', 'completed');

    // Step 3: Code generation based on mentor feedback
    updateLoaderStep('generation', 'processing');
    
    try {
      const response = await fetch(`${apiBase}/api/implementation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          projectName,
          techStack,
          implementation: mentorImplementation,
          analysisData: aiAnalysis,
          mentorFeedback: feedback
        })
      });

      const result = await response.json();
      
      if (result.success) {
        updateLoaderStep('generation', 'completed');
        
        // Step 4: Pull request creation
        if (result.pullRequest?.success) {
          updateLoaderStep('pr', 'processing');
          await new Promise(resolve => setTimeout(resolve, 500));
          updateLoaderStep('pr', 'completed');
        } else {
          updateLoaderStep('pr', 'failed');
        }
        
        // Check for deployment (regardless of PR status)
        if (result.deployment?.success) {
          const deploymentMessage = result.deployment.cached 
            ? `Mentor feedback implementation successful! Using existing deployment: ${result.deployment.deploymentUrl}`
            : result.pullRequest?.success 
              ? `Mentor feedback implementation successful! Pull request created and deployed: ${result.deployment.deploymentUrl}`
              : `Mentor feedback implementation successful! Branch deployed: ${result.deployment.deploymentUrl}`;
          showNotification(deploymentMessage, 'success');
        } else if (result.pullRequest?.success) {
          showNotification(`Mentor feedback implementation successful! Pull request created: ${result.pullRequest.url}`, 'success');
        } else {
          showNotification(`Mentor feedback implementation completed! Branch: ${result.codeGeneration.branchName}`, 'success');
        }
        
        if (onImplementationStart) {
          onImplementationStart([mentorImplementation.id]);
        }
        
        // Refresh recent implementations
        fetchRecentImplementations();
        
        // Close loader after a delay
        setTimeout(() => {
          closeLoader();
        }, 2000);
      } else {
        updateLoaderStep('generation', 'failed');
        showNotification(`Mentor feedback implementation failed: ${result.error || 'Unknown error'}`, 'error');
        
        setTimeout(() => {
          closeLoader();
        }, 2000);
      }
    } catch (error) {
      updateLoaderStep('generation', 'failed');
      console.error('Mentor feedback implementation failed:', error);
      showNotification(`Mentor feedback implementation failed: ${error.message}`, 'error');
      
      setTimeout(() => {
        closeLoader();
      }, 2000);
    }
  };

  const handleBatchImplementation = async () => {
    if (!repoUrl) {
      showNotification('Repository URL is required for implementation', 'error');
      return;
    }

    if (selectedImplementations.length === 0) {
      showNotification('Please select at least one implementation', 'warning');
      return;
    }

    setIsImplementing(true);
    
    try {
      const { bugFixes, features } = getImplementationSuggestions();
      const allImplementations = [...bugFixes, ...features];
      const implementations = selectedImplementations
        .map(id => allImplementations.find(impl => impl.id === id))
        .filter(impl => impl !== undefined);

      // Initialize loader for batch
      initializeLoaderSteps(`Batch Implementation (${implementations.length} items)`);

      // Update all steps to processing
      updateLoaderStep('workspace', 'processing');
      updateLoaderStep('config', 'processing');
      updateLoaderStep('generation', 'processing');

      const response = await fetch(`${apiBase}/api/implementation/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          projectName,
          techStack,
          implementations,
          analysisData: aiAnalysis,
          createSeparatePRs: true
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const { successful, failed, total } = result.summary;
        
        // Update all steps to completed
        updateLoaderStep('workspace', 'completed');
        updateLoaderStep('config', 'completed');
        updateLoaderStep('generation', 'completed');
        updateLoaderStep('pr', 'completed');
        
        showNotification(`Batch implementation completed! ${successful}/${total} implementations successful`, 'success');
        
        // Show detailed results
        const successfulPRs = result.results
          .filter(r => r.success && r.pullRequest?.success)
          .map(r => r.pullRequest.url);
          
        if (successfulPRs.length > 0) {
          console.log('Created pull requests:', successfulPRs);
        }
        
        if (onImplementationStart) {
          onImplementationStart(selectedImplementations);
        }
        
        // Clear selection after successful batch
        setSelectedImplementations([]);
        
        // Refresh recent implementations
        fetchRecentImplementations();
        
        // Close loader after a delay
        setTimeout(() => {
          closeLoader();
        }, 2000);
      } else {
        updateLoaderStep('generation', 'failed');
        showNotification(`Batch implementation failed: ${result.error || 'Unknown error'}`, 'error');
        
        setTimeout(() => {
          closeLoader();
        }, 2000);
      }
    } catch (error) {
      updateLoaderStep('generation', 'failed');
      console.error('Batch implementation failed:', error);
      showNotification(`Batch implementation failed: ${error.message}`, 'error');
      
      setTimeout(() => {
        closeLoader();
      }, 2000);
    } finally {
      setIsImplementing(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!repoUrl) {
      alert('Repository URL is required for plan generation');
      return;
    }

    if (selectedImplementations.length === 0) {
      alert('Please select at least one implementation');
      return;
    }

    try {
      const { bugFixes, features } = getImplementationSuggestions();
      const allImplementations = [...bugFixes, ...features];
      const implementations = selectedImplementations
        .map(id => allImplementations.find(impl => impl.id === id))
        .filter(impl => impl !== undefined);

      const response = await fetch(`${apiBase}/api/implementation/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          projectName,
          techStack,
          implementations,
          analysisData: aiAnalysis
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const plan = result.plan;
        let planSummary = `Implementation Plan for ${plan.summary.totalItems} items:\n\n`;
        planSummary += `Total Estimated Time: ${plan.summary.estimatedTotalTime}\n`;
        planSummary += `Average Risk Level: ${plan.summary.averageRiskLevel}/5\n`;
        planSummary += `Recommended Batch Size: ${plan.summary.recommendedBatchSize}\n\n`;
        
        planSummary += 'Recommended Order:\n';
        plan.summary.suggestedOrder.forEach((item, index) => {
          planSummary += `${index + 1}. ${item.title}\n`;
        });
        
        if (plan.recommendations.length > 0) {
          planSummary += '\nRecommendations:\n';
          plan.recommendations.forEach(rec => {
            planSummary += `• ${rec}\n`;
          });
        }
        
        alert(planSummary);
        console.log('Detailed plan:', plan);
        
        if (onGeneratePlan) {
          onGeneratePlan(selectedImplementations);
        }
      } else {
        alert(`Plan generation failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Plan generation failed:', error);
      alert(`Plan generation failed: ${error.message}`);
    }
  };

  const renderImplementationCard = (implementation: ImplementationItem) => (
    <Card 
      key={implementation.id}
      variant="outlined" 
      sx={{ 
        border: selectedImplementations.includes(implementation.id) ? 2 : 1,
        borderColor: selectedImplementations.includes(implementation.id) ? 'primary.main' : 'divider',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 1
        }
      }}
      onClick={() => handleImplementationToggle(implementation.id)}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon 
                sx={{ 
                  mr: 1, 
                  color: selectedImplementations.includes(implementation.id) ? 'primary.main' : 'grey.400',
                  fontSize: 20 
                }} 
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {implementation.title}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {implementation.description}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip 
            label={implementation.difficulty} 
            size="small" 
            color={implementation.difficulty === 'Beginner' ? 'success' : implementation.difficulty === 'Intermediate' ? 'warning' : 'error'}
            variant="outlined"
          />
          <Chip 
            label={implementation.estimatedTime} 
            size="small" 
            variant="outlined"
            icon={<ScheduleIcon />}
          />
          <Chip 
            label={implementation.priority} 
            size="small" 
            color={implementation.priority === 'High' ? 'error' : implementation.priority === 'Medium' ? 'warning' : 'default'}
            variant="outlined"
          />
          <Chip 
            label={implementation.category} 
            size="small" 
            variant="outlined"
          />
        </Box>
        
        {selectedImplementations.includes(implementation.id) && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button 
              variant="contained" 
              size="small" 
              startIcon={<PlayArrowIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleStartImplementation(implementation.id);
              }}
            >
              Generate Implementation
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<CodeIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleViewExamples(implementation.id);
              }}
            >
              View Examples
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const { bugFixes, features } = getImplementationSuggestions();

  const renderRecentImplementations = () => {
    if (recentImplementations.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HistoryIcon sx={{ mr: 2, fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Implementations
              </Typography>
            </Box>
            
            <List dense>
              {recentImplementations.slice(0, 3).map((impl, index) => (
                <motion.div
                  key={impl.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {impl.status === 'completed' && <CheckCircleIcon color="success" />}
                      {impl.status === 'failed' && <BugReportIcon color="error" />}
                      {impl.status === 'processing' && <CircularProgress size={16} />}
                      {impl.status === 'pending' && <ScheduleIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={impl.title}
                      secondary={`${impl.category} • ${impl.difficulty} • ${new Date(impl.createdAt).toLocaleDateString()}`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'caption', sx: { opacity: 0.8 } }}
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {impl.pullRequest?.success && (
                        <IconButton 
                          size="small"
                          onClick={() => window.open(impl.pullRequest.url, '_blank')}
                          sx={{ color: 'white' }}
                          title="View Pull Request"
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      )}
                      {impl.deployment?.success && (
                        <IconButton 
                          size="small"
                          onClick={() => window.open(impl.deployment.url, '_blank')}
                          sx={{ color: 'white' }}
                          title="View Live Deployment"
                        >
                          <PublicIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderMentorFeedback = () => {
    if (mentorFeedback.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon sx={{ mr: 2, fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Mentor Feedback
              </Typography>
            </Box>
            
            <List dense>
              {mentorFeedback.slice(0, 3).map((feedback, index) => (
                <motion.div
                  key={feedback._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={feedback.mentor?.name || 'Anonymous Mentor'}
                      secondary={`${feedback.feedbackText.substring(0, 100)}${feedback.feedbackText.length > 100 ? '...' : ''} • ${new Date(feedback.createdAt).toLocaleDateString()}`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'caption', sx: { opacity: 0.8 } }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {feedback.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StarIcon sx={{ fontSize: 16, color: 'gold' }} />
                          <Typography variant="caption" sx={{ color: 'white' }}>
                            {feedback.rating}/5
                          </Typography>
                        </Box>
                      )}
                      <IconButton 
                        size="small"
                        onClick={() => handleMentorFeedbackImplementation(feedback)}
                        sx={{ color: 'white' }}
                      >
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderCustomPromptDialog = () => (
    <Dialog
      open={showCustomPromptDialog}
      onClose={() => setShowCustomPromptDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoFixHighIcon color="primary" />
        Custom Implementation Prompt
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Describe what you want to implement. Be specific about the functionality, files to modify, and any requirements.
        </Typography>
        <TextField
          multiline
          rows={6}
          fullWidth
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Example: Add user authentication with JWT tokens, create login/logout endpoints, and protect routes with middleware..."
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Tips for better results:</strong><br />
            • Be specific about the technology stack and frameworks<br />
            • Mention which files or components should be modified<br />
            • Include any specific requirements or constraints<br />
            • Consider the current project structure and patterns
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowCustomPromptDialog(false)}>
          Cancel
        </Button>
        <Button 
          onClick={handleCustomPromptSubmit}
          variant="contained"
          disabled={!customPrompt.trim() || isSubmittingCustomPrompt}
          startIcon={isSubmittingCustomPrompt ? <CircularProgress size={16} /> : <SendIcon />}
        >
          {isSubmittingCustomPrompt ? 'Generating...' : 'Generate Implementation'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Code Implementation Recommendations
        </Typography>
        
        {showHistory && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh History">
              <IconButton onClick={fetchRecentImplementations} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {showHistory && renderRecentImplementations()}

      {showHistory && (
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label="Recommendations" 
              icon={<CodeIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Mentor Feedback" 
              icon={<SchoolIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Custom Prompt" 
              icon={<EditIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="History" 
              icon={<HistoryIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>
      )}

      {activeTab === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {aiAnalysis 
          ? "Based on the AI analysis, here are actionable implementation suggestions to improve your project."
          : "Here are general implementation suggestions to improve your project. Run AI analysis for personalized recommendations."
        } Select the features or fixes you'd like to implement.
      </Typography>

      {/* Implementation Categories */}
      <Box sx={{ display: 'grid', gap: 3 }}>
        
        {/* Bug Fixes & Improvements */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BugReportIcon sx={{ mr: 2, color: 'error.main', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Bug Fixes & Code Quality Improvements
                {aiAnalysis && (
                  <Chip 
                    label={`Score: ${aiAnalysis.codeQuality}/100`} 
                    size="small" 
                    color={aiAnalysis.codeQuality > 80 ? 'success' : aiAnalysis.codeQuality > 60 ? 'warning' : 'error'}
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gap: 2 }}>
              {bugFixes.map(renderImplementationCard)}
            </Box>
          </CardContent>
        </Card>

        {/* New Features */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BuildIcon sx={{ mr: 2, color: 'success.main', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Feature Enhancements
                {aiAnalysis && (
                  <Chip 
                    label={`Maintainability: ${aiAnalysis.maintainability}/100`} 
                    size="small" 
                    color={aiAnalysis.maintainability > 80 ? 'success' : aiAnalysis.maintainability > 60 ? 'warning' : 'error'}
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gap: 2 }}>
              {features.map(renderImplementationCard)}
            </Box>
          </CardContent>
        </Card>

        {/* Action Summary */}
        {selectedImplementations.length > 0 && (
          <Card sx={{ bgcolor: 'primary.50', border: 2, borderColor: 'primary.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarBorderIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Selected Implementations ({selectedImplementations.length})
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3 }}>
                You've selected {selectedImplementations.length} implementation{selectedImplementations.length > 1 ? 's' : ''}. 
                Ready to start implementing these improvements?
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  startIcon={<PlayArrowIcon />}
                  onClick={handleBatchImplementation}
                >
                  Start Implementation
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  startIcon={<CodeIcon />}
                  onClick={handleGeneratePlan}
                >
                  Generate Implementation Plan
                </Button>
                <Button 
                  variant="text" 
                  size="large" 
                  onClick={() => setSelectedImplementations([])}
                >
                  Clear Selection
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
        </motion.div>
      )}

      {activeTab === 1 && showHistory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Mentor Feedback & Implementation
          </Typography>
          
          {mentorFeedback.length > 0 ? (
            <Box sx={{ display: 'grid', gap: 2 }}>
              {mentorFeedback.map((feedback, index) => (
                <Card key={feedback._id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {feedback.mentor?.name || 'Anonymous Mentor'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {feedback.mentor?.organization || 'Mentor'} • {new Date(feedback.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      {feedback.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon sx={{ fontSize: 16, color: 'gold' }} />
                          <Typography variant="body2">{feedback.rating}/5</Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {feedback.feedbackText}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleMentorFeedbackImplementation(feedback)}
                      >
                        Implement Feedback
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<RateReviewIcon />}
                      >
                        View Details
                      </Button>
                      {feedback.deployment?.success && (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<PublicIcon />}
                          onClick={() => window.open(feedback.deployment.url, '_blank')}
                          color="success"
                        >
                          View Live
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No Mentor Feedback Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mentors haven't provided feedback for this project yet. Check back later or invite mentors to review your project.
              </Typography>
            </Card>
          )}
        </motion.div>
      )}

      {activeTab === 2 && showHistory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Custom Implementation Prompt
          </Typography>
          
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AutoFixHighIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Create Custom Implementation
                </Typography>
              </Box>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Have a specific feature or improvement in mind? Use our custom prompt feature to describe exactly what you want to implement.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  startIcon={<EditIcon />}
                  onClick={() => setShowCustomPromptDialog(true)}
                >
                  Create Custom Prompt
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  startIcon={<CodeIcon />}
                >
                  View Examples
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Example Prompts
              </Typography>
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Authentication System
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    "Add JWT-based authentication with login/logout endpoints, password hashing, and protected routes middleware"
                  </Typography>
                </Card>
                
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    API Documentation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    "Generate comprehensive API documentation with Swagger/OpenAPI specs and interactive documentation"
                  </Typography>
                </Card>
                
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Testing Framework
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    "Set up Jest testing framework with unit tests for all components and integration tests for API endpoints"
                  </Typography>
                </Card>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 3 && showHistory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ImplementationHistory 
            projectName={projectName}
            repoUrl={repoUrl}
            onRefresh={fetchRecentImplementations}
            showStatistics={true}
          />
        </motion.div>
      )}

      {/* Custom Prompt Dialog */}
      {renderCustomPromptDialog()}

      {/* Implementation Loader */}
      <ImplementationLoader
        isVisible={showLoader}
        implementationTitle={loaderSteps.length > 0 ? loaderSteps[0]?.title || 'Implementation' : 'Implementation'}
        steps={loaderSteps}
        currentStep={currentStep}
        overallProgress={overallProgress}
        onClose={closeLoader}
        showDetails={true}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CodeImplementations;

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
} from '@mui/material';
import {
  Code as CodeIcon,
  Build as BuildIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Schedule as ScheduleIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

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
  onImplementationStart?: (implementationIds: string[]) => void;
  onGeneratePlan?: (implementationIds: string[]) => void;
  onViewExamples?: (implementationId: string) => void;
}

const CodeImplementations: React.FC<CodeImplementationsProps> = ({
  aiAnalysis,
  projectName,
  techStack,
  onImplementationStart,
  onGeneratePlan,
  onViewExamples
}) => {
  const [selectedImplementations, setSelectedImplementations] = useState<string[]>([]);

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

  const handleStartImplementation = (implementationId: string) => {
    if (onImplementationStart) {
      onImplementationStart([implementationId]);
    } else {
      alert(`Starting implementation for: ${implementationId}`);
    }
  };

  const handleViewExamples = (implementationId: string) => {
    if (onViewExamples) {
      onViewExamples(implementationId);
    } else {
      alert(`Showing code examples for: ${implementationId}`);
    }
  };

  const handleBatchImplementation = () => {
    if (onImplementationStart) {
      onImplementationStart(selectedImplementations);
    } else {
      alert(`Starting implementation for ${selectedImplementations.length} selected item(s)`);
    }
  };

  const handleGeneratePlan = () => {
    if (onGeneratePlan) {
      onGeneratePlan(selectedImplementations);
    } else {
      alert('Generating detailed implementation plan...');
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

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Code Implementation Recommendations
      </Typography>
      
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
    </Box>
  );
};

export default CodeImplementations;

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  GitHub as GitHubIcon,
  Description as DocumentationIcon,
  Download as DownloadIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/useRedux';
import Navigation from '../../components/Navigation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = React.useState(0);
  
  const project = useAppSelector((state) => 
    state.projects.projects.find(p => p.id === id)
  );

  if (!project) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" align="center">Project not found</Typography>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button onClick={() => navigate('/')}>Back to Projects</Button>
          </Box>
        </Container>
      </>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mb: 2 }}
          >
            Back to Projects
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {project.title}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {project.description}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<FavoriteIcon />}
              sx={{ ml: 2 }}
            >
              Express Interest
            </Button>
          </Box>

          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Health Report" />
            <Tab label="Roadmap" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          {/* Demo Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Demo
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    width: '100%',
                    height: 400,
                    bgcolor: 'hsl(var(--muted))',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography color="text.secondary">
                    Project Demo Screenshot/Video
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Project Details */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Project Details
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {project.description} This project aims to provide an innovative solution 
                  using cutting-edge technologies and modern development practices.
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Objectives
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Provide an interactive learning environment" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Cover a wide range of programming languages and concepts" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Offer real-time feedback and guidance to users" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Build a community of learners and contributors" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Current Status */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Current Status
            </Typography>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1">Completion</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {project.aiHealthScore}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={project.aiHealthScore} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Box>

          {/* Tech Stack */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Tech Stack
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {project.techStack.map((tech, index) => (
                <Chip
                  key={index}
                  label={tech}
                  variant="outlined"
                  sx={{ 
                    bgcolor: 'hsl(var(--primary))',
                    color: 'white',
                    borderColor: 'hsl(var(--primary))'
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Links */}
          {/* <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {project.githubUrl && (
                <Button
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  onClick={() => window.open(project.githubUrl, '_blank')}
                >
                  GitHub Repository
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<DocumentationIcon />}
              >
                Read the full project documentation
              </Button>
            </Box>
          </Box> */}

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {(
                <Button
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  onClick={() => window.open("https://github.com/varun-101/array_garray", '_blank')}
                >
                  GitHub Repository
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<DocumentationIcon />}
              >
                Read the full project documentation
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Health Report Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              AI Project Analyzer Health Report
            </Typography>
            <Card>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText primary="Enhance front-end design for better user experience." />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Expand tutorial content to cover more advanced topics." />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Improve documentation clarity and completeness." />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Add comprehensive testing suite for better reliability." />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Optimize performance for better user experience." />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Roadmap Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Next Steps Roadmap
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText primary="Recruiting front-end developers to refine the user interface." />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Creating new tutorials on data structures and algorithms." />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Updating the project documentation with detailed setup instructions and contribution guidelines." />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Auto-Generated Pitch Deck
            </Typography>
            <Card>
              <CardContent>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  fullWidth
                >
                  Download the pitch deck
                </Button>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Container>
    </>
  );
};

export default ProjectDetails;
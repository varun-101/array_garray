/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  GitHub as GitHubIcon,
  Description as DocumentationIcon,
  Download as DownloadIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";
import { useAppSelector } from "../../hooks/useRedux";
import Navigation from "../../components/Navigation";
import AISummary from "../../components/AISummary";
import CodeImplementations from "../../components/CodeImplementations";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import MermaidChart from "@/components/MermaidChart";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface BackendProject {
  _id: string;
  projectName: string;
  projectDescription: string;
  projectLink: string;
  techStack: string[];
  projectImgUrl?: string;
  projectImgUrls?: string[];
  projectVideoUrls?: string[];
  demoUrl?: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  tags: string[];
  user: {
    _id: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
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
  const [tabValue, setTabValue] = useState(0);
  const [project, setProject] = useState<BackendProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [mermaidCode, setMermaidCode] = useState("");
  const apiBase =
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError("Project ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${apiBase}/api/projects/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Project not found");
          } else {
            setError("Failed to fetch project");
          }
          return;
        }

        const projectData = await response.json();
        setProject(projectData);

        const aiResponse = await fetch(`${apiBase}/ai/generate`, {
          method: "POST", // proper way to send body
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectDescription: projectData.projectDescription,
          }),
        });

        const parsedAiResponse = await aiResponse.json();
        setMermaidCode(parsedAiResponse.message);
        
      } catch (err) {
        setError("Failed to fetch project");
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, apiBase]);

  if (loading) {
    return (
      <>
        <Navigation />
        <Container
          maxWidth="lg"
          sx={{
            py: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress />
        </Container>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || "Project not found"}
          </Alert>
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button onClick={() => navigate("/")}>Back to Projects</Button>
          </Box>
        </Container>
      </>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handler functions for the CodeImplementations component
  const handleImplementationStart = (implementationIds: string[]) => {
    // TODO: Connect to backend API for code generation
    console.log("Starting implementation for:", implementationIds);
    alert(`Starting implementation for ${implementationIds.length} item(s)`);
  };

  const handleGeneratePlan = (implementationIds: string[]) => {
    // TODO: Connect to backend API for plan generation
    console.log("Generating plan for:", implementationIds);
    alert("Generating detailed implementation plan...");
  };

  const handleViewExamples = (implementationId: string) => {
    // TODO: Show code examples modal or navigate to examples page
    console.log("Viewing examples for:", implementationId);
    alert(`Showing code examples for: ${implementationId}`);
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{ mb: 2 }}
          >
            Back to Projects
          </Button>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {project.projectName}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {project.projectDescription}
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
            <Tab label="AI Summary" />
            <Tab label="Code Implementations" />
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
                {(() => {
                  // Combine images and videos into a single array for the carousel
                  const mediaItems = [];

                  // Add videos
                  if (
                    project.projectVideoUrls &&
                    project.projectVideoUrls.length > 0
                  ) {
                    project.projectVideoUrls.forEach((videoUrl, index) => {
                      mediaItems.push({
                        type: "video",
                        url: videoUrl,
                        alt: `Project video ${index + 1}`,
                      });
                    });
                  }
                  // Add images
                  if (
                    project.projectImgUrls &&
                    project.projectImgUrls.length > 0
                  ) {
                    project.projectImgUrls.forEach((imgUrl, index) => {
                      mediaItems.push({
                        type: "image",
                        url: imgUrl,
                        alt: `Project screenshot ${index + 1}`,
                      });
                    });
                  } else if (project.projectImgUrl) {
                    mediaItems.push({
                      type: "image",
                      url: project.projectImgUrl,
                      alt: "Project screenshot",
                    });
                  }

                  if (mediaItems.length === 0) {
                    return (
                      <Box
                        sx={{
                          width: "100%",
                          height: 400,
                          bgcolor: "hsl(var(--muted))",
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography color="text.secondary">
                          No demo media available
                        </Typography>
                      </Box>
                    );
                  }

                  if (mediaItems.length === 1) {
                    const item = mediaItems[0];
                    return (
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: 400,
                        }}
                      >
                        {item.type === "image" ? (
                          <Box
                            component="img"
                            src={item.url}
                            alt={item.alt}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          />
                        ) : (
                          <Box
                            component="video"
                            src={item.url}
                            controls
                            sx={{
                              width: "100%",
                              height: "100%",
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          />
                        )}
                      </Box>
                    );
                  }

                  // Multiple items - use carousel
                  return (
                    <Box sx={{ position: "relative", width: "100%" }}>
                      <Carousel className="w-full">
                        <CarouselContent>
                          {mediaItems.map((item, index) => (
                            <CarouselItem key={index}>
                              <Box
                                sx={{
                                  position: "relative",
                                  width: "100%",
                                  height: 400,
                                }}
                              >
                                {item.type === "image" ? (
                                  <Box
                                    component="img"
                                    src={item.url}
                                    alt={item.alt}
                                    sx={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  />
                                ) : (
                                  <Box
                                    component="video"
                                    src={item.url}
                                    controls
                                    sx={{
                                      width: "100%",
                                      height: "100%",
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  />
                                )}
                              </Box>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </Box>
                  );
                })()}
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
                  {project.projectDescription}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                  <Chip
                    label={`Category: ${project.category || "Not specified"}`}
                    variant="outlined"
                    color="primary"
                  />
                  <Chip
                    label={`Difficulty: ${project.difficulty}`}
                    variant="outlined"
                    color="secondary"
                  />
                  <Chip
                    label={`Estimated Time: ${
                      project.estimatedTime || "Not specified"
                    }`}
                    variant="outlined"
                    color="default"
                  />
                </Box>

                {project.tags && project.tags.length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Tags
                    </Typography>
                    <Box
                      sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}
                    >
                      {project.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Current Status */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Project Information
            </Typography>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="body1">Created</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="body1">Last Updated</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="body1">Author</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {project.user?.name || project.user?.username || "Unknown"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Tech Stack */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Tech Stack
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {project.techStack && project.techStack.length > 0 ? (
                project.techStack.map((tech, index) => (
                  <Chip
                    key={index}
                    label={tech}
                    variant="outlined"
                    sx={{
                      bgcolor: "hsl(var(--primary))",
                      color: "white",
                      borderColor: "hsl(var(--primary))",
                    }}
                  />
                ))
              ) : (
                <Typography color="text.secondary">
                  No tech stack specified
                </Typography>
              )}
            </Box>
          </Box>

          {/* Links */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {project.projectLink && (
                <Button
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  onClick={() => window.open(project.projectLink, "_blank")}
                >
                  GitHub Repository
                </Button>
              )}
              {project.demoUrl && (
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => window.open(project.demoUrl, "_blank")}
                >
                  Live Demo
                </Button>
              )}
              <Button variant="outlined" startIcon={<DocumentationIcon />}>
                Read the full project documentation
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Health Report Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Project Analysis
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  This project appears to be in active development. Here are
                  some observations:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Project has a clear description and defined tech stack" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={`Difficulty level: ${project.difficulty}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={`Category: ${
                        project.category || "Not specified"
                      }`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={`Estimated completion time: ${
                        project.estimatedTime || "Not specified"
                      }`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={`Tech stack includes ${
                        project.techStack?.length || 0
                      } technologies`}
                    />
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
              Road Map
            </Typography>
            <Card sx={{ mb: 3 }}>
              <MermaidChart code={mermaidCode} />
            </Card>
          </Box>
        </TabPanel>

        {/* AI Summary Tab */}
        <TabPanel value={tabValue} index={3}>
          <AISummary
            projectName={project.projectName}
            techStack={project.techStack || []}
            difficulty={project.difficulty}
            category={project.category || "Not specified"}
            repoUrl={project.projectLink}
            projectId={project._id}
            onAnalysisUpdate={(analysis) => setAiAnalysis(analysis)}
          />
        </TabPanel>

        {/* Code Implementations Tab */}
        <TabPanel value={tabValue} index={4}>
          <CodeImplementations
            aiAnalysis={aiAnalysis}
            projectName={project.projectName}
            techStack={project.techStack || []}
            onImplementationStart={handleImplementationStart}
            onGeneratePlan={handleGeneratePlan}
            onViewExamples={handleViewExamples}
          />
        </TabPanel>
      </Container>
    </>
  );
};

export default ProjectDetails;

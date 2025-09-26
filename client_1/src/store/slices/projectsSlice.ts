import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  category: string;
  status: 'seeking-contributors' | 'in-progress' | 'completed' | 'paused';
  author: {
    name: string;
    avatar: string;
    university: string;
  };
  contributors: number;
  lastUpdated: string;
  githubUrl?: string;
  demoUrl?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  aiHealthScore: number;
}

interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [
    {
      id: '1',
      title: 'Smart Campus Navigator',
      description: 'AI-powered mobile app to help students navigate campus efficiently with real-time crowd data and optimal route suggestions.',
      techStack: ['React Native', 'Node.js', 'TensorFlow', 'MongoDB'],
      category: 'Mobile Development',
      status: 'seeking-contributors',
      author: {
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        university: 'MIT'
      },
      contributors: 3,
      lastUpdated: '2024-01-15',
      githubUrl: 'https://github.com/alexchen/smart-campus',
      tags: ['AI', 'Mobile', 'Navigation', 'Real-time'],
      difficulty: 'intermediate',
      estimatedTime: '3-4 weeks',
      aiHealthScore: 85
    },
    {
      id: '2',
      title: 'EcoTrack - Carbon Footprint Tracker',
      description: 'Web application for students to track and reduce their carbon footprint with gamification and peer competitions.',
      techStack: ['Vue.js', 'Python', 'FastAPI', 'PostgreSQL'],
      category: 'Web Development',
      status: 'in-progress',
      author: {
        name: 'Sarah Kim',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        university: 'Stanford'
      },
      contributors: 5,
      lastUpdated: '2024-01-20',
      demoUrl: 'https://ecotrack-demo.vercel.app',
      tags: ['Sustainability', 'Gamification', 'Web App'],
      difficulty: 'beginner',
      estimatedTime: '2-3 weeks',
      aiHealthScore: 92
    },
    {
      id: '3',
      title: 'Neural Network Visualizer',
      description: 'Interactive tool to visualize and understand how neural networks learn, perfect for ML education.',
      techStack: ['D3.js', 'Python', 'Flask', 'TensorFlow'],
      category: 'Machine Learning',
      status: 'seeking-contributors',
      author: {
        name: 'Mike Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        university: 'Carnegie Mellon'
      },
      contributors: 2,
      lastUpdated: '2024-01-18',
      githubUrl: 'https://github.com/mikero/nn-visualizer',
      tags: ['Machine Learning', 'Visualization', 'Education'],
      difficulty: 'advanced',
      estimatedTime: '4-6 weeks',
      aiHealthScore: 78
    }
  ],
  selectedProject: null,
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    selectProject: (state, action: PayloadAction<Project | null>) => {
      state.selectedProject = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProjects,
  addProject,
  updateProject,
  selectProject,
  setLoading,
  setError,
} = projectsSlice.actions;

export default projectsSlice.reducer;
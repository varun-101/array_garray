import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RepoItem {
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

interface ReposState {
  repos: RepoItem[];
  selectedRepo: RepoItem | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReposState = {
  repos: [],
  selectedRepo: null,
  loading: false,
  error: null,
};

const reposSlice = createSlice({
  name: 'repos',
  initialState,
  reducers: {
    setRepos: (state, action: PayloadAction<RepoItem[]>) => {
      state.repos = action.payload;
    },
    addRepo: (state, action: PayloadAction<RepoItem>) => {
      state.repos.push(action.payload);
    },
    updateRepo: (state, action: PayloadAction<RepoItem>) => {
      const index = state.repos.findIndex(r => r.fullName === action.payload.fullName);
      if (index !== -1) {
        state.repos[index] = action.payload;
      }
    },
    removeRepo: (state, action: PayloadAction<string>) => {
      state.repos = state.repos.filter(r => r.fullName !== action.payload);
    },
    selectRepo: (state, action: PayloadAction<RepoItem | null>) => {
      state.selectedRepo = action.payload;
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
  setRepos,
  addRepo,
  updateRepo,
  removeRepo,
  selectRepo,
  setLoading,
  setError,
} = reposSlice.actions;

export default reposSlice.reducer;




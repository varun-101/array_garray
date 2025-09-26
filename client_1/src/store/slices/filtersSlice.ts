import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FiltersState {
  searchQuery: string;
  category: string;
  techStack: string[];
  difficulty: string;
  status: string;
  sortBy: 'newest' | 'popular' | 'health-score' | 'contributors';
}

const initialState: FiltersState = {
  searchQuery: '',
  category: 'all',
  techStack: [],
  difficulty: 'all',
  status: 'all',
  sortBy: 'newest',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    setTechStack: (state, action: PayloadAction<string[]>) => {
      state.techStack = action.payload;
    },
    setDifficulty: (state, action: PayloadAction<string>) => {
      state.difficulty = action.payload;
    },
    setStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'newest' | 'popular' | 'health-score' | 'contributors'>) => {
      state.sortBy = action.payload;
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.category = 'all';
      state.techStack = [];
      state.difficulty = 'all';
      state.status = 'all';
    },
  },
});

export const {
  setSearchQuery,
  setCategory,
  setTechStack,
  setDifficulty,
  setStatus,
  setSortBy,
  clearFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
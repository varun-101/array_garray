import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'hsl(220, 85%, 35%)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: 'hsl(260, 75%, 60%)',
      contrastText: '#ffffff',
    },
    background: {
      default: 'hsl(220, 20%, 98%)',
      paper: 'hsl(0, 0%, 100%)',
    },
    text: {
      primary: 'hsl(220, 25%, 15%)',
      secondary: 'hsl(220, 15%, 45%)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          boxShadow: '0 4px 20px hsl(220, 25%, 15%, 0.08)',
          '&:hover': {
            boxShadow: '0 8px 30px hsl(220, 25%, 15%, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px hsl(220, 25%, 15%, 0.08)',
          '&:hover': {
            boxShadow: '0 8px 30px hsl(220, 25%, 15%, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
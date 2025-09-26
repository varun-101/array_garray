import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: 'hsl(220, 85%, 55%)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: 'hsl(220, 85%, 65%)',
      contrastText: '#ffffff',
    },
    background: {
      default: 'hsl(220, 25%, 8%)',
      paper: 'hsl(220, 20%, 12%)',
    },
    text: {
      primary: 'hsl(220, 15%, 92%)',
      secondary: 'hsl(220, 15%, 65%)',
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
          boxShadow: '0 4px 20px hsl(0, 0%, 0%, 0.3)',
          '&:hover': {
            boxShadow: '0 8px 30px hsl(0, 0%, 0%, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px hsl(0, 0%, 0%, 0.3)',
          '&:hover': {
            boxShadow: '0 8px 30px hsl(0, 0%, 0%, 0.4)',
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
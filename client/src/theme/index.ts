import { createTheme, alpha } from '@mui/material/styles';

// Custom color palette with gradients
const primaryGradient = 'linear-gradient(45deg, #2563eb 30%, #60a5fa 90%)';
const secondaryGradient = 'linear-gradient(45deg, #7c3aed 30%, #a78bfa 90%)';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#7c3aed',
      light: '#a78bfa',
      dark: '#5b21b6',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#fecaca',
      dark: '#b91c1c',
    },
    success: {
      main: '#22c55e',
      light: '#bbf7d0',
      dark: '#15803d',
    },
    warning: {
      main: '#f59e0b',
      light: '#fde68a',
      dark: '#b45309',
    },
    info: {
      main: '#3b82f6',
      light: '#bfdbfe',
      dark: '#1d4ed8',
    },
    grey: {
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(15, 23, 42, 0.08)',
    '0px 2px 4px rgba(15, 23, 42, 0.08)',
    '0px 4px 6px rgba(15, 23, 42, 0.08)',
    '0px 6px 8px rgba(15, 23, 42, 0.08)',
    '0px 8px 16px rgba(15, 23, 42, 0.08)',
    '0px 12px 24px rgba(15, 23, 42, 0.08)',
    '0px 16px 32px rgba(15, 23, 42, 0.08)',
    '0px 20px 40px rgba(15, 23, 42, 0.08)',
    '0px 24px 48px rgba(15, 23, 42, 0.08)',
    '0px 28px 56px rgba(15, 23, 42, 0.08)',
    '0px 32px 64px rgba(15, 23, 42, 0.08)',
    '0px 36px 72px rgba(15, 23, 42, 0.08)',
    '0px 40px 80px rgba(15, 23, 42, 0.08)',
    '0px 44px 88px rgba(15, 23, 42, 0.08)',
    '0px 48px 96px rgba(15, 23, 42, 0.08)',
    '0px 52px 104px rgba(15, 23, 42, 0.08)',
    '0px 56px 112px rgba(15, 23, 42, 0.08)',
    '0px 60px 120px rgba(15, 23, 42, 0.08)',
    '0px 64px 128px rgba(15, 23, 42, 0.08)',
    '0px 68px 136px rgba(15, 23, 42, 0.08)',
    '0px 72px 144px rgba(15, 23, 42, 0.08)',
    '0px 76px 152px rgba(15, 23, 42, 0.08)',
    '0px 80px 160px rgba(15, 23, 42, 0.08)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f5f9',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#cbd5e1',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: primaryGradient,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          padding: '0.5rem 1.25rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: primaryGradient,
          },
          '&.MuiButton-containedSecondary': {
            background: secondaryGradient,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '1.25rem 1.5rem',
        },
        title: {
          fontSize: '1.125rem',
          fontWeight: 600,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '1.25rem 1.5rem',
          '&:last-child': {
            paddingBottom: '1.25rem',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '1rem',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: alpha('#60a5fa', 0.05),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.75rem',
            transition: 'box-shadow 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha('#60a5fa', 0.25)}`,
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '1px 0 5px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          margin: '0.25rem 0.5rem',
          padding: '0.5rem 1rem',
          '&.Mui-selected': {
            backgroundColor: alpha('#2563eb', 0.08),
            '&:hover': {
              backgroundColor: alpha('#2563eb', 0.12),
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '1rem 0',
        },
      },
    },
  },
});

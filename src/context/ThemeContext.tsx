import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('admin-panel-theme');
    return (saved as ThemeMode) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('admin-panel-theme', mode);
  }, [mode]);

  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main:  mode === 'light' ? '#0D9488' : '#2DD4BF',   // Teal
        light: mode === 'light' ? '#14B8A6' : '#5EEAD4',
        dark:  mode === 'light' ? '#0F766E' : '#0D9488',
        contrastText: '#ffffff',
      },
      secondary: {
        main: mode === 'light' ? '#D97706' : '#FBBF24',    // Amber
        light: mode === 'light' ? '#F59E0B' : '#FCD34D',
        dark:  mode === 'light' ? '#B45309' : '#D97706',
        contrastText: '#ffffff',
      },
      error:   { main: '#EF4444' },
      warning: { main: '#F59E0B' },
      info:    { main: '#06B6D4' },
      success: { main: '#10B981' },
      background: {
        default: mode === 'light' ? '#F0FDFC' : '#040D18',
        paper:   mode === 'light' ? '#FFFFFF' : '#071727',
      },
      text: {
        primary:   mode === 'light' ? '#134E4A' : '#CCFBF1',
        secondary: mode === 'light' ? '#0F766E' : '#5EEAD4',
        disabled:  mode === 'light' ? '#99F6E4' : '#1E3A4C',
      },
      divider: mode === 'light' ? '#CCFBF1' : '#0D2D40',
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0.3 },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '@import': 'url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap")',
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: mode === 'light' ? '#99F6E4 transparent' : '#0D2D40 transparent',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 14,
            border: `1px solid ${mode === 'light' ? '#CCFBF1' : '#0D2D40'}`,
            boxShadow: mode === 'light'
              ? '0 1px 3px 0 rgba(13,148,136,0.07), 0 1px 2px -1px rgba(13,148,136,0.07)'
              : '0 4px 24px 0 rgba(0,0,0,0.45)',
            transition: 'box-shadow 0.25s ease, transform 0.25s ease',
            '&:hover': {
              boxShadow: mode === 'light'
                ? '0 10px 25px -5px rgba(13,148,136,0.12)'
                : '0 10px 30px 0 rgba(0,0,0,0.6)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 700,
            padding: '9px 20px',
            boxShadow: 'none',
            transition: 'all 0.18s ease',
            '&:hover': { boxShadow: 'none', transform: 'translateY(-1px)' },
            '&:active': { transform: 'translateY(0px)' },
            '&.MuiButton-containedPrimary': {
              background: mode === 'light'
                ? 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)'
                : 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
              color: mode === 'light' ? '#ffffff' : '#040D18',
              '&:hover': {
                background: mode === 'light'
                  ? 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)'
                  : 'linear-gradient(135deg, #5EEAD4 0%, #2DD4BF 100%)',
              },
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: mode === 'light' ? '#F0FDFC' : '#0A1A28',
              transition: 'background 0.2s',
              '& fieldset': { borderColor: mode === 'light' ? '#99F6E4' : '#0D2D40' },
              '&:hover fieldset': { borderColor: mode === 'light' ? '#2DD4BF' : '#0D9488' },
              '&.Mui-focused fieldset': { borderColor: mode === 'light' ? '#0D9488' : '#2DD4BF' },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          outlined: {
            borderRadius: 8,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#050F1C',
            borderRight: `1px solid ${mode === 'light' ? '#CCFBF1' : '#0D2D40'}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: mode === 'light' ? 'rgba(240,253,252,0.85)' : 'rgba(4,13,24,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${mode === 'light' ? '#CCFBF1' : '#0D2D40'}`,
            boxShadow: 'none',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: mode === 'light' ? '#F0FDFC' : '#071727',
              color: mode === 'light' ? '#0F766E' : '#2DD4BF',
              fontWeight: 700,
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              borderBottom: `2px solid ${mode === 'light' ? '#99F6E4' : '#0D2D40'}`,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          body: {
            borderColor: mode === 'light' ? '#F0FDFC' : '#0A1A28',
            fontSize: '0.875rem',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'light' ? '#F0FDFC' : '#0A1A28',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, fontSize: '0.75rem' },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            '& .MuiPaginationItem-root': {
              borderRadius: 8,
              fontWeight: 600,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            backgroundImage: 'none',
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#071727',
            border: `1px solid ${mode === 'light' ? '#CCFBF1' : '#0D2D40'}`,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'light' ? '#134E4A' : '#2DD4BF',
            color: mode === 'light' ? '#CCFBF1' : '#040D18',
            fontWeight: 600,
            fontSize: '0.75rem',
            borderRadius: 6,
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return context;
};

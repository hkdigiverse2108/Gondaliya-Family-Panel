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
        main:  mode === 'light' ? '#2E3192' : '#6366F1',   // Gondaliya Navy / Brand Blue
        light: mode === 'light' ? '#4F52C9' : '#8B5CF6',
        dark:  mode === 'light' ? '#1B1C63' : '#4F46E5',
        contrastText: '#ffffff',
      },
      secondary: {
        main: mode === 'light' ? '#129B63' : '#1EC47D',    // Gondaliya Emerald Green / Brand Green
        light: mode === 'light' ? '#1BC27F' : '#34D399',
        dark:  mode === 'light' ? '#0B6A43' : '#059669',
        contrastText: '#ffffff',
      },
      error:   { main: '#EF4444' },
      warning: { main: '#F59E0B' },
      info:    { main: '#3B82F6' },
      success: { main: '#10B981' },
      background: {
        default: mode === 'light' ? '#F5F7FB' : '#0B0F19',
        paper:   mode === 'light' ? '#FFFFFF' : '#111827',
      },
      text: {
        primary:   mode === 'light' ? '#1E293B' : '#F8FAFC',
        secondary: mode === 'light' ? '#475569' : '#94A3B8',
        disabled:  mode === 'light' ? '#94A3B8' : '#475569',
      },
      divider: mode === 'light' ? '#E2E8F0' : '#1F2937',
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
            scrollbarColor: mode === 'light' ? '#CBD5E1 transparent' : '#374151 transparent',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 14,
            border: `1px solid ${mode === 'light' ? '#E2E8F0' : '#1F2937'}`,
            boxShadow: mode === 'light'
              ? '0 1px 3px 0 rgba(46,49,146,0.04), 0 1px 2px -1px rgba(46,49,146,0.04)'
              : '0 4px 24px 0 rgba(0,0,0,0.55)',
            transition: 'box-shadow 0.25s ease, transform 0.25s ease',
            '&:hover': {
              boxShadow: mode === 'light'
                ? '0 10px 25px -5px rgba(46,49,146,0.08)'
                : '0 10px 30px 0 rgba(0,0,0,0.7)',
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
                ? 'linear-gradient(135deg, #2E3192 0%, #1B1C63 100%)'
                : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#ffffff',
              '&:hover': {
                background: mode === 'light'
                  ? 'linear-gradient(135deg, #1B1C63 0%, #0F1043 100%)'
                  : 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
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
              backgroundColor: mode === 'light' ? '#F8FAFC' : '#1F2937',
              transition: 'background 0.2s',
              '& fieldset': { borderColor: mode === 'light' ? '#E2E8F0' : '#1F2937' },
              '&:hover fieldset': { borderColor: mode === 'light' ? '#4F52C9' : '#8B5CF6' },
              '&.Mui-focused fieldset': { borderColor: mode === 'light' ? '#2E3192' : '#6366F1' },
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
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#0B0F19',
            borderRight: `1px solid ${mode === 'light' ? '#E2E8F0' : '#1F2937'}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: mode === 'light' ? 'rgba(245,247,251,0.85)' : 'rgba(11,15,25,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${mode === 'light' ? '#E2E8F0' : '#1F2937'}`,
            boxShadow: 'none',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: mode === 'light' ? '#F8FAFC' : '#1F2937',
              color: mode === 'light' ? '#2E3192' : '#6366F1',
              fontWeight: 700,
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              borderBottom: `2px solid ${mode === 'light' ? '#E2E8F0' : '#1F2937'}`,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          body: {
            borderColor: mode === 'light' ? '#E2E8F0' : '#1F2937',
            fontSize: '0.875rem',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'light' ? '#F1F5F9' : '#1F2937',
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
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#111827',
            border: `1px solid ${mode === 'light' ? '#E2E8F0' : '#1F2937'}`,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'light' ? '#2E3192' : '#6366F1',
            color: '#FFFFFF',
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

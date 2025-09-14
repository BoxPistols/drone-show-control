'use client';

import { createTheme, Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    drone: {
      primary: string;
      secondary: string;
      warning: string;
      success: string;
    };
    map: {
      day: string;
      night: string;
    };
  }

  interface PaletteOptions {
    drone?: {
      primary: string;
      secondary: string;
      warning: string;
      success: string;
    };
    map?: {
      day: string;
      night: string;
    };
  }
}

export const createCustomTheme = (mode: 'light' | 'dark'): Theme => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
      },
      secondary: {
        main: mode === 'light' ? '#dc004e' : '#f48fb1',
      },
      background: {
        default: mode === 'light' ? '#ffffff' : '#0a0a0a',
        paper: mode === 'light' ? '#f5f5f5' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#171717' : '#ededed',
        secondary: mode === 'light' ? '#666666' : '#b3b3b3',
      },
      drone: {
        primary: '#00ff88', // ドローンプライマリ色（グリーン）
        secondary: '#ff6b35', // ドローンセカンダリ色（オレンジ）
        warning: '#ffeb3b', // 警告色（イエロー）
        success: '#4caf50', // 成功色（グリーン）
      },
      map: {
        day: '#e3f2fd', // 昼間マップ背景
        night: '#0a0a0a', // 夜間マップ背景
      },
    },
    typography: {
      fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              mode === 'light'
                ? '0 2px 8px rgba(0,0,0,0.1)'
                : '0 2px 8px rgba(255,255,255,0.1)',
          },
        },
      },
    },
  });
};

export const lightTheme = createCustomTheme('light');
export const darkTheme = createCustomTheme('dark');
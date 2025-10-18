// components/Providers.tsx
'use client';
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ThemeRegistry from './ThemeRegistry';
import Layout from './layout';
import AuthProvider from './AuthProvider';

const theme = createTheme();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (

    <ThemeRegistry>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
        <AuthProvider>
          {children}
        </AuthProvider>
        </Layout>
      </ThemeProvider>
    </ThemeRegistry>

  );
}
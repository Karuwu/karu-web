// components/ThemeRegistry.tsx
'use client';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';
import * as React from 'react';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { useServerInsertedHTML } from 'next/navigation';
import createEmotionCache from '../lib/createEmotionCache';

// Light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
});

// Dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

interface ThemeRegistryProps {
  children: ReactNode;
  mode?: 'light' | 'dark';
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  // Create a new emotion cache for each request/client instance
  const [cache] = React.useState(() => createEmotionCache());

  // Create an emotion server instance bound to that cache
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = React.useMemo(
    () => createEmotionServer(cache),
    [cache]
  );

  useServerInsertedHTML(() => {
    // extract the critical CSS chunks from the rendered markup
    const chunks = extractCriticalToChunks('<!doctype html>');
    // construct style tags string
    const styles = constructStyleTagsFromChunks(chunks);
    // Return a React node that Next will place into the HTML head during SSR
    return <div dangerouslySetInnerHTML={{ __html: styles }} />;
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
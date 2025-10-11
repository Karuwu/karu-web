// app/layout.tsx

'use client';
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import '../styles/globals.css';
import Providers from '../components/Providers';

const theme = createTheme();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>

            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Container maxWidth="lg" sx={{ py: 4 }}>
                <Providers>{children}</Providers>
              </Container>
            </ThemeProvider>

      </body>
    </html>
  );
}

// app/about/loading.tsx
'use client';
import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function ScoreListLoading() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 2, ml: 7 }}>
      <CircularProgress sx={{ mt: 1 }} />
      <Typography sx={{ mt: 2, mb: 1 }}>Fetching Data..</Typography>
    </Box>
  );
}
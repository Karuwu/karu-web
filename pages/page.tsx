// pages/page.tsx  OR app/about/page.tsx depending on your project

import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import ScoreList from '../components/ScoreList';
import { topScores } from '../data/topScores';

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ pt: 4, pb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Taiko Journey
      </Typography>

      <ScoreList scores={topScores} />

      <Box mt={3}>
        <Link href="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
          ← Back to Home
        </Link>

      </Box>
    </Container>
  );
}

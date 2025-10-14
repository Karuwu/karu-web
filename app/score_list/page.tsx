// app/score_list/page.tsx

import React, { Suspense } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import ScoreList from '../../components/ScoreList';
import ScoreListLoading from './ScoreListLoading';

export default function AboutPage() {
  return (
    <section>
      <h1 className="text-4xl font-bold mb-4">My Taiko Journey</h1>

      <Suspense fallback={<ScoreListLoading />}>
        <ScoreList />
      </Suspense>

      <Box mt={3}>
        <Link href="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
          ← Back to Home
        </Link>
      </Box>
    </section>
  );
}
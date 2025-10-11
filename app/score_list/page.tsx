// app/score_list/page.tsx

import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import ScoreList from '../../components/ScoreList'; // use absolute or adjust relative path
import { getTopScores } from '../../lib/topScores'; // path to your data helper

export default async function AboutPage() {
  const topScores = await getTopScores(); // server fetch - suspends the component

  return (
    <section>
<h1 className="text-4xl font-bold mb-4">My Taiko Journey</h1>


      <ScoreList scores={topScores} />

      <Box mt={3}>
        <Link href="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
          ← Back to Home
        </Link>
      </Box>
    </section>
  );
}

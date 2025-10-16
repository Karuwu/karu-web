// File: app/scores/[id]/page.tsx
import { getScoreById } from '../../../lib/topScores';
import { notFound } from 'next/navigation';
import { Container, Paper, Typography, Box, Avatar, Link } from '@mui/material';
import styles from '../../../components/ScoreList.module.css';
import { Score } from '../../../lib/topScores';

export default async function ScoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log('params.id:', id);

  const score = await getScoreById(id);
  console.log('Fetched score:', score);

  if (!score) {
    notFound();
  }

  const fmt = (n?: number) => (typeof n === 'number' ? n.toLocaleString() : '0');

  const normalizeKey = (difficulty?: string) =>
    difficulty ? String(difficulty).toLowerCase().replace(/\s+/g, '') : '';

  const iconForDifficulty = (difficulty?: string) =>
    `/images/${normalizeKey(difficulty)}.svg`;

  const iconForFullCombo = (score: Score) => {
    if (score.isFullCombo && (score.goods ?? 0) === 0 && (score.bads ?? 0) === 0)
      return '/images/donfc.png';
    if (score.isFullCombo) return '/images/fc.png';
    return '/images/clear.png';
  };

  const classForDifficulty = (difficulty?: string) => {
    const key = normalizeKey(difficulty);
    if (key === 'oni') return styles.difficultyOni;
    if (key === 'hard') return styles.difficultyHard;
    if (key === 'uraoni') return styles.difficultyUraoni;
    return '';
  };

  const formatDate = (date?: string | { seconds: number; nanoseconds: number }) => {
    if (!date) return 'Unknown';
    if (typeof date === 'string') return date;
    const d = new Date(date.seconds * 1000);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom sx={{ mt: 4 }}>
        Score Details
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box display="flex" alignItems="center" mb={2.5}>
          <Avatar
            src={iconForDifficulty(score.difficulty)}
            alt={`${score.difficulty} icon`}
            variant="square"
            sx={{ width: 50, height: 50, bgcolor: 'transparent', ml: 0 }}
          />
          <Typography variant="h3" component="h1" fontWeight={700} marginLeft={2}>
            {score.song}
          </Typography>

        </Box>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={iconForFullCombo(score)}
            alt="Full combo status icon"
            variant="square"
            sx={{ width: 23.5, height: 21, bgcolor: 'transparent', mr: 1 }}
          />
          <Typography component="span" variant="h5">
            {fmt(score.score)}
          </Typography>
        </Box>
        <Box display="flex" gap={4} mb={2}>
          <Box display="flex" flexDirection="column" gap={0.4}>
            <Typography component="span" variant="body1">
              Greats: <strong>{fmt(score.greats ?? 0)}</strong>
            </Typography>
            <Typography component="span" variant="body1">
              Goods: <strong>{fmt(score.goods ?? 0)}</strong>
            </Typography>
            <Typography component="span" variant="body1">
              Bads: <strong>{fmt(score.bads ?? 0)}</strong>
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" gap={0.4}>
            <Typography component="span" variant="body1">
              Hits: <strong>{fmt(score.hits ?? 0)}</strong>
            </Typography>
            <Typography component="span" variant="body1">
              Max Combo: <strong>{fmt(score.maxCombo ?? 0)}</strong>
            </Typography>
          </Box>
        </Box>
        <Typography variant="subtitle1">
          Date Achieved: {formatDate(score.dateAchieved)}
        </Typography>
      </Paper>
              <Box mt={2}>
          <Link href="/score_list" sx={{ color: '#1976d2', textDecoration: 'none', fontSize: '1rem' }}>
            ← Back to Scores
          </Link>
        </Box>
    </Container>
  );
}
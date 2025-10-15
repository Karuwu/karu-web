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
    notFound(); // Trigger /app/not-found.tsx
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

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Score Details
        </Typography>
        <Box display="flex" alignItems="flex-start">
          <Avatar
            src={iconForDifficulty(score.difficulty)}
            alt={`${score.difficulty} icon`}
            variant="square"
            sx={{ width: 40, height: 40, bgcolor: 'transparent' }}
          />
          <Box ml={2}>
            <Typography component="span" variant="subtitle1" fontWeight={700}>
              {score.song}
            </Typography>{' '}
            <Typography component="span" variant="body2" className={classForDifficulty(score.difficulty)}>
              ({score.difficulty})
            </Typography>{' '}
            <Typography component="span" variant="body2">
              - {fmt(score.score)}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mt={0.4} alignItems="center" ml={0.3}>
              <Avatar
                src={iconForFullCombo(score)}
                alt="Full combo status icon"
                variant="square"
                sx={{ width: 23.5, height: 21, bgcolor: 'transparent', mr: 0 }}
              />
              <Typography component="span" variant="caption">
                Greats: <strong>{fmt(score.greats ?? 0)}</strong>
              </Typography>
              <Typography component="span" variant="caption">
                Goods: <strong>{fmt(score.goods ?? 0)}</strong>
              </Typography>
              <Typography component="span" variant="caption">
                Bads: <strong>{fmt(score.bads ?? 0)}</strong>
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box mt={2}>
          <Link href="/score_list" sx={{ color: '#1976d2', textDecoration: 'none' }}>
            Back to Scores
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
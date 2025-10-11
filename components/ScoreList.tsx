'use client';
import React, { useEffect, useState } from 'react';
import { List, ListItem, Avatar, Box, Typography, Paper } from '@mui/material';
import type { Score } from '../lib/topScores';
import styles from './ScoreList.module.css';

type Props = { scores?: Score[] };

export default function ScoreList({ scores }: Props) {
  const [mounted, setMounted] = useState(false);

  // Only render after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!scores) return <Typography color="error">No scores provided</Typography>;
  if (scores.length === 0) return <Typography color="textSecondary">No scores to show</Typography>;

  if (!mounted) {
    // Render a placeholder while server HTML is empty
    return <Paper elevation={1} sx={{ padding: 2 }}>Loading scores...</Paper>;
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
    <Paper elevation={1} sx={{ padding: 2 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Top Scores
      </Typography>
      <List>
        {scores.map((score) => (
          <ListItem key={score.id} disableGutters>
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
              <Box display="flex" flexWrap="wrap" gap={2} mt={0.5}>
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
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

'use client';
import React from 'react';
import Link from 'next/link';
import { List, ListItem, Avatar, Box, Typography, Paper } from '@mui/material';
import { Score } from '../lib/topScores';
import styles from './ScoreList.module.css';

interface Props {
  scores: Score[];
}

export default function ScoreList({ scores }: Props) {
  if (!scores || scores.length === 0) {
    return <Typography color="textSecondary">No scores to show</Typography>;
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
    <Paper elevation={2} sx={{ mb: 2, p: 2 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Top Scores
      </Typography>
      <List>
        {scores.map((score) => (
          <Link key={score.id} href={`/scores/${score.id}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem
              disableGutters
              sx={{
                p: 0.5,
                backgroundColor: 'transparent',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
              }}
            >
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
            </ListItem>
          </Link>
        ))}
      </List>
    </Paper>
  );
}
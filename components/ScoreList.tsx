// components/ScoreList.tsx

import React from 'react';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Score } from '../data/topScores'; // adjust path if needed
import styles from './ScoreList.module.css';

type Props = {
  scores?: Score[];
};

const normalizeKey = (difficulty?: string) =>
  difficulty ? String(difficulty).toLowerCase().replace(/\s+/g, '') : '';

const iconForDifficulty = (difficulty?: string) =>
  `/images/${normalizeKey(difficulty)}.svg`; // keep /images/ if your assets are there

const iconForFullCombo = (score: Score) => {
  if (score.isFullCombo && (score.goods ?? 0) === 0 && (score.bads ?? 0) === 0) {
    return '/images/donfc.png'; // perfect full combo
  } else if (score.isFullCombo) {
    return '/images/fc.png'; // normal full combo
  } else {
    return '/images/clear.png'; // not full combo
  }
};

const classForDifficulty = (difficulty?: string) => {
  const key = normalizeKey(difficulty);
  if (key === 'oni') return styles.difficultyOni;
  if (key === 'hard') return styles.difficultyHard;
  if (key === 'uraoni') return styles.difficultyUraoni;
  return '';
};

const fmt = (n?: number) => (typeof n === 'number' ? n.toLocaleString() : '0');

export default function ScoreList({ scores }: Props) {
  console.log('ScoreList received scores:', scores);

  if (!scores) {
    return <Typography color="error">No scores provided</Typography>;
  }

  if (scores.length === 0) {
    return <Typography color="textSecondary">No scores to show</Typography>;
  }

  return (
    <Paper elevation={1} sx={{ padding: 2 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Top Scores
      </Typography>

      <List className={styles.list}>
        {scores.map((score) => {
          const difficultyClass = classForDifficulty(score.difficulty);
          const diffIcon = iconForDifficulty(score.difficulty);
          const fullComboIcon = iconForFullCombo(score);

          return (
            <ListItem key={score.id} disableGutters sx={{ paddingY: 1 }}>
              <ListItemAvatar>
                <Avatar
                  src={diffIcon}
                  alt={`${score.difficulty} icon`}
                  variant="square"
                  sx={{ width: 40, height: 40, bgcolor: 'transparent' }}
                  imgProps={{
                    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    },
                    style: { objectFit: 'contain', background: 'transparent' },
                  }}
                />
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box display="inline-flex" alignItems="baseline" gap={1}>
                      <Typography component="span" variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {score.song}
                      </Typography>

                      <Typography
                        component="span"
                        variant="body2"
                        className={difficultyClass}
                      >
                        ({score.difficulty})
                      </Typography>

                      <Typography component="span" variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                        - {fmt(score.score)}
                      </Typography>

                      {/* vertical separator */}
                      <Typography component="span" aria-hidden="true" className={styles.sep}>
                        |
                      </Typography>

                      {/* Full Combo icon */}
                      <img
                        src={fullComboIcon}
                        alt={
                          score.isFullCombo
                            ? (score.goods === 0 && score.bads === 0 ? 'Perfect Full Combo' : 'Full Combo')
                            : 'Not Full Combo'
                        }
                        title={
                          score.isFullCombo
                            ? (score.goods === 0 && score.bads === 0 ? 'Perfect Full Combo' : 'Full Combo')
                            : 'Not Full Combo'
                        }
                        className={styles.fcIcon}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                        style={{ width: 24, height: 24, objectFit: 'contain', marginLeft: 8 }}
                      />
                    </Box>
                  </Box>
                }
                secondary={
                  <Box className={styles.stats} display="flex" flexWrap="wrap" gap={2} mt={0.5}>
                    <Typography component="span" variant="caption" className={styles.statItem}>
                      Greats: <strong>{fmt(score.greats ?? 0)}</strong>
                    </Typography>
                    <Typography component="span" variant="caption" className={styles.statItem}>
                      Goods: <strong>{fmt(score.goods ?? 0)}</strong>
                    </Typography>
                    <Typography component="span" variant="caption" className={styles.statItem}>
                      Bads: <strong>{fmt(score.bads ?? 0)}</strong>
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}

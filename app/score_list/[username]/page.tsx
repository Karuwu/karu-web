import { Box, Typography } from '@mui/material';
import { db } from '../../../lib/firebase';
import { fetchTopScores } from '../../../app/actions';
import ScoreList from '../../../components/ScoreList';
import ScoreListControls from '../../../components/ScoreListControls';

interface Score {
  id: string;
  song: string;
  difficulty: string;
  score: number;
  greats: number;
  goods: number;
  bads: number;
  isFullCombo: boolean;
  hits?: number;
  maxCombo?: number;
  dateAchieved: string;
  userId: string;
}

export default async function UserScoreListPage({ params, searchParams }: { params: { username: string }, searchParams: { idToken?: string } }) {
  const { username } = params;
  const idToken = searchParams.idToken || '';

  const userSnapshot = await db.collection('users').where('username', '==', username).get();
  if (userSnapshot.empty) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Typography variant="h5" gutterBottom>User not found</Typography>
      </Box>
    );
  }

  const userDoc = userSnapshot.docs[0];
  const userData = userDoc.data();
  const uid = userDoc.id;

  if (userData.isPrivate) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Typography variant="h5" gutterBottom>This user&apos;s profile is private</Typography>
      </Box>
    );
  }

  let scores: Score[] = [];
  try {
    scores = await fetchTopScores(uid, idToken);
    console.log('UserScoreListPage: Fetched scores:', scores);
  } catch (error) {
    console.error('UserScoreListPage: Error fetching scores:', error);
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>{username}&apos;s Scores</Typography>
      <ScoreListControls userId={uid} idToken={idToken} />
      <ScoreList scores={scores} />
    </Box>
  );
}
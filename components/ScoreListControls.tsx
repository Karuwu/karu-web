'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button, Box } from '@mui/material';
import AddScoreForm from './AddScoreForm';
import { getUserIdToken } from '../lib/authUtils';
import { fetchTopScores } from '../app/actions';

export default function ScoreListControls({ userId, idToken }: { userId: string, idToken: string }) {
  const { user, loading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [scores, setScores] = useState<any[]>([]);

  if (authLoading || !user || user.uid !== userId) {
    return null;
  }

  const handleSuccess = async () => {
    setShowForm(false);
    const token = await getUserIdToken();
    if (token) {
      const updatedScores = await fetchTopScores(userId, token);
      setScores(updatedScores);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        variant="contained"
        onClick={() => setShowForm(!showForm)}
        sx={{ backgroundColor: '#1976d2' }}
      >
        {showForm ? 'Cancel' : 'Add Score'}
      </Button>
      {showForm && (
        <AddScoreForm
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  );
}
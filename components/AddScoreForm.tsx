'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createScore } from '../app/actions';
import { getUserIdToken } from '../lib/authUtils';
import { Box, TextField, Button, CircularProgress, Alert, FormControlLabel, Checkbox, MenuItem, Typography } from '@mui/material';
import { useAuth } from './AuthProvider';

export default function AddScoreForm({ onSuccess }: { onSuccess: () => void }) {
  const [song, setSong] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [score, setScore] = useState('');
  const [greats, setGreats] = useState('');
  const [goods, setGoods] = useState('');
  const [bads, setBads] = useState('');
  const [isFullCombo, setIsFullCombo] = useState(false);
  const [hits, setHits] = useState('');
  const [maxCombo, setMaxCombo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!user) {
      setMessage('You must be logged in to add a score.');
      setLoading(false);
      router.push('/login');
      return;
    }

    try {
      const idToken = await getUserIdToken();
      if (!idToken) {
        throw new Error('Failed to authenticate. Please log in again.');
      }
      await createScore({
        song,
        difficulty,
        score: parseInt(score),
        greats: parseInt(greats),
        goods: parseInt(goods),
        bads: parseInt(bads),
        isFullCombo,
        hits: hits ? parseInt(hits) : undefined,
        maxCombo: maxCombo ? parseInt(maxCombo) : undefined,
        idToken,
      });
      setMessage('Score added successfully!');
      setSong('');
      setDifficulty('');
      setScore('');
      setGreats('');
      setGoods('');
      setBads('');
      setIsFullCombo(false);
      setHits('');
      setMaxCombo('');
      onSuccess();
    } catch (err: any) {
      setMessage(err.message || 'Failed to add score. Check console.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 2 }} />;
  }

  if (!user) {
    return null;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
      <Typography variant="h6">Add New Score</Typography>
      {message && <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mt: 2 }}>{message}</Alert>}
      <TextField
        label="Song"
        fullWidth
        margin="normal"
        value={song}
        onChange={(e) => setSong(e.target.value)}
        required
      />
      <TextField
        select
        label="Difficulty"
        fullWidth
        margin="normal"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        required
      >
        {['Easy', 'Normal', 'Hard', 'Oni', 'UraOni'].map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </TextField>
      <TextField
        label="Score"
        type="number"
        fullWidth
        margin="normal"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        required
      />
      <TextField
        label="Greats"
        type="number"
        fullWidth
        margin="normal"
        value={greats}
        onChange={(e) => setGreats(e.target.value)}
        required
      />
      <TextField
        label="Goods"
        type="number"
        fullWidth
        margin="normal"
        value={goods}
        onChange={(e) => setGoods(e.target.value)}
        required
      />
      <TextField
        label="Bads"
        type="number"
        fullWidth
        margin="normal"
        value={bads}
        onChange={(e) => setBads(e.target.value)}
        required
      />
      <FormControlLabel
        control={<Checkbox checked={isFullCombo} onChange={(e) => setIsFullCombo(e.target.checked)} />}
        label="Full Combo"
      />
      <TextField
        label="Hits"
        type="number"
        fullWidth
        margin="normal"
        value={hits}
        onChange={(e) => setHits(e.target.value)}
      />
      <TextField
        label="Max Combo"
        type="number"
        fullWidth
        margin="normal"
        value={maxCombo}
        onChange={(e) => setMaxCombo(e.target.value)}
      />
      <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Submit Score'}
      </Button>
    </Box>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Box, Typography, Switch, Button, CircularProgress, Alert, FormControlLabel } from '@mui/material';
import { auth, db } from '../../lib/firebase-client';
import { useAuth } from '../../components/AuthProvider';

export default function SettingsPage() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      const fetchProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setIsPrivate(userDoc.data()?.isPrivate || false);
          }
        } catch (err: any) {
          setError('Failed to load profile settings.');
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const handleTogglePrivate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      await updateDoc(doc(db, 'users', user.uid), { isPrivate: event.target.checked });
      setIsPrivate(event.target.checked);
    } catch (err: any) {
      setError('Failed to update profile visibility.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError('');
    try {
      await signOut(auth);
      router.push('/');
    } catch (err: any) {
      setError('Failed to sign out.');
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;
  }

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>Settings</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControlLabel
          control={<Switch checked={isPrivate} onChange={handleTogglePrivate} disabled={loading} />}
          label="Make my profile private"
        />
        <Button variant="contained" onClick={handleSignOut} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Sign Out'}
        </Button>
      </Box>
    </Box>
  );
}
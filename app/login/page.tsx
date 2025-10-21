'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import { auth } from '../../lib/firebase-client';
import { useAuth } from '../../components/AuthProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      console.log('LoginPage: User already logged in, redirecting to /');
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || user) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('LoginPage: Attempting login with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('LoginPage: Login successful, user:', userCredential.user.uid);
      router.push('/');
    } catch (err: any) {
      console.error('LoginPage: Login failed:', {
        message: err.message || 'Unknown error',
        code: err.code || 'No code',
        details: err.details || 'No details',
        stack: err.stack || 'No stack',
      });
      setError(err.message || 'Failed to log in. Please check your credentials or Firebase configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>Log In</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={loading} fullWidth>
          {loading ? <CircularProgress size={24} /> : 'Log In'}
        </Button>
        <Typography>
          Don’t have an account? <Link href="/register" style={{ color: '#1976d2' }}>Register here</Link>
        </Typography>
      </Box>
    </Box>
  );
}
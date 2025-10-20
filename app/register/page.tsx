'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import { auth, db } from '../../lib/firebase-client';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validateUsername = (username: string) => {
    return /^[a-zA-Z0-9_-]{3,}$/.test(username);
  };

  const checkUsernameUnique = async (username: string) => {
    const usernameLower = username.toLowerCase();
    const q = query(collection(db, 'users'), where('usernameLower', '==', usernameLower));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateUsername(username)) {
      setError('Username must be at least 3 characters and contain only letters, numbers, underscores, or hyphens.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const isUnique = await checkUsernameUnique(username);
      if (!isUnique) {
        setError('Username has already been taken!');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        usernameLower: username.toLowerCase(),
        email: email,
        isPrivate: false,
        isAdmin: false,
        createdAt: new Date(),
      });

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>Register</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          fullWidth
          helperText="At least 3 characters, letters, numbers, underscores, or hyphens."
        />
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
        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={loading} fullWidth>
          {loading ? <CircularProgress size={24} /> : 'Register'}
        </Button>
        <Typography>
          Already have an account? <Link href="/login" style={{ color: '#1976d2' }}>Log in here</Link>
        </Typography>
      </Box>
    </Box>
  );
}
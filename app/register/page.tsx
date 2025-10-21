'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import { auth, db } from '../../lib/firebase-client';
import { useAuth } from '../../components/AuthProvider';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      console.log('RegisterPage: User already logged in, redirecting to /');
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || user) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;
  }

  const validateUsername = (username: string) => {
    return /^[a-zA-Z0-9_-]{3,}$/.test(username);
  };

  const checkUsernameUnique = async (username: string) => {
    const usernameLower = username.toLowerCase();
    try {
      const q = query(collection(db, 'users'), where('usernameLower', '==', usernameLower));
      const querySnapshot = await getDocs(q);
      console.log('RegisterPage: Username check:', { username, isUnique: querySnapshot.empty });
      return querySnapshot.empty;
    } catch (err) {
      console.error('RegisterPage: Username check failed:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!validateUsername(username)) {
        setError('Username must be at least 3 characters and contain only letters, numbers, underscores, or hyphens.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      console.log('RegisterPage: Attempting registration with email:', email);
      const isUnique = await checkUsernameUnique(username);
      if (!isUnique) {
        setError('Username has already been taken!');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('RegisterPage: User created, UID:', user.uid);

      await updateProfile(user, { displayName: username });
      console.log('RegisterPage: Profile updated with username:', username);

      // Re-authenticate to ensure valid token for Firestore write
      const reAuth = await signInWithEmailAndPassword(auth, email, password);
      console.log('RegisterPage: Re-authenticated, UID:', reAuth.user.uid);

      await setDoc(doc(db, 'users', user.uid), {
        username,
        usernameLower: username.toLowerCase(),
        email,
        isPrivate: false,
        isAdmin: false,
        createdAt: new Date(),
      });
      console.log('RegisterPage: User document created for UID:', user.uid);

      router.push('/');
    } catch (err) {
      console.error('RegisterPage: Registration failed:', err);
      setError(err.message || 'Failed to register. Please check your credentials or Firebase configuration.');
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
          helperText="At least 3 characters."
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
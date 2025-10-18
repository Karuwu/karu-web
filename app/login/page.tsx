'use client'; // This is CRITICAL

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase-client'; // Use the CLIENT auth
import { Button, TextField, Container, Typography, Box } from '@mui/material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form from refreshing the page
    setError(null);
    try {
      // Try to sign in
      await signInWithEmailAndPassword(auth, email, password);
      // On success, redirect to the admin page
      router.push('/admin');
    } catch (err) {
      setError('Failed to log in. Check your email and password.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box component="form" onSubmit={handleLogin} sx={{ mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Login
        </Typography>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <Typography color="error" sx={{ my: 2 }}>
            {error}
          </Typography>
        )}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
          Login
        </Button>
      </Box>
    </Container>
  );
}

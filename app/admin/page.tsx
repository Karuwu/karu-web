// File: app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase-client';
import { Container, Typography, CircularProgress, Button } from '@mui/material';
import { useAuth } from '../../components/AuthProvider';
import CreatePostForm from '../../components/CreatePostForm';
import { getUserIdToken } from '../../lib/authUtils';
import { checkAdmin } from '../../app/actions';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('AdminPage: No user, redirecting to /login');
      router.push('/login');
      return;
    }

    if (user) {
      getUserIdToken().then(async (idToken) => {
        if (!idToken) {
          console.log('AdminPage: No idToken, redirecting to /login');
          setError('Failed to authenticate');
          router.push('/login');
          return;
        }

        try {
          const adminStatus = await checkAdmin(idToken);
          console.log('AdminPage: checkAdmin result:', adminStatus);
          setIsAdmin(adminStatus);
          setLoadingAdmin(false);
        } catch (err: any) {
          console.error('AdminPage: Error checking admin status:', err);
          setError(err.message || 'Failed to verify admin status');
          setLoadingAdmin(false);
        }
      }).catch(err => {
        console.error('AdminPage: Error getting idToken:', err);
        setError('Failed to authenticate');
        setLoadingAdmin(false);
      });
    }
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('AdminPage: Signed out successfully');
      router.push('/');
    } catch (error) {
      console.error('AdminPage: Error signing out:', error);
    }
  };

  if (authLoading || loadingAdmin || isAdmin === null) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 10 }} />;
  }

  if (!user || !isAdmin) {
    console.log('AdminPage: Not admin, redirecting to /admin-error');
    router.push('/admin-error');
    return null;
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4 }}>Error</Typography>
        <Typography>{error}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        Welcome, {user.email}!
      </Typography>
      <Typography>This is the protected admin dashboard.</Typography>
      <CreatePostForm />
      <Button onClick={handleSignOut} sx={{ mt: 2 }}>
        Sign Out
      </Button>
    </Container>
  );
}
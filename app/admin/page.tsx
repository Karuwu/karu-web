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

          if (!adminStatus) {
            console.log('AdminPage: Not admin, redirecting to /admin-error');
            router.push('/admin-error');
          }
        } catch (err: any) {
          if (err.message.includes('auth/invalid-credential')) {
            console.log('AdminPage: Invalid credential, attempting to refresh idToken');
            try {
              const newIdToken = await getUserIdToken(); // Force refresh
              if (!newIdToken) {
                setError('Failed to refresh authentication token');
                router.push('/login');
                return;
              }
              const adminStatus = await checkAdmin(newIdToken);
              console.log('AdminPage: checkAdmin result after refresh:', adminStatus);
              setIsAdmin(adminStatus);
              setLoadingAdmin(false);
              if (!adminStatus) {
                console.log('AdminPage: Not admin after refresh, redirecting to /admin-error');
                router.push('/admin-error');
              }
            } catch (refreshErr: any) {
              console.error('AdminPage: Error refreshing idToken:', refreshErr);
              setError(refreshErr.message || 'Failed to verify admin status');
              setLoadingAdmin(false);
              router.push('/admin-error');
            }
          } else {
            console.error('AdminPage: Error checking admin status:', err);
            setError(err.message || 'Failed to verify admin status');
            setLoadingAdmin(false);
            router.push('/admin-error');
          }
        }
      }).catch(err => {
        console.error('AdminPage: Error getting idToken:', err);
        setError('Failed to authenticate');
        setLoadingAdmin(false);
        router.push('/admin-error');
      });
    }
  }, [user, authLoading, router]);

  if (authLoading || loadingAdmin || isAdmin === null) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 10 }} />;
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4 }}>Error</Typography>
        <Typography>{error}</Typography>
      </Container>
    );
  }

  if (!user || !isAdmin) {
    return null; // Redirect handled in useEffect
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        Welcome, {user.email}!
      </Typography>
      <Typography>This is the protected admin dashboard.</Typography>
      <CreatePostForm />
      <Button onClick={() => signOut(auth).then(() => router.push('/')).catch(err => console.error('AdminPage: Error signing out:', err))} sx={{ mt: 2 }}>
        Sign Out
      </Button>
    </Container>
  );
}
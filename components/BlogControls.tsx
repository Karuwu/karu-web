'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button, Box } from '@mui/material';
import CreatePostForm from './CreatePostForm';
import { getUserIdToken } from '../lib/authUtils';
import { fetchBlogPosts } from '../app/actions';

export default function BlogControls({ userId, idToken }: { userId: string, idToken: string }) {
  const { user, loading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  if (authLoading || !user || user.uid !== userId) {
    return null;
  }

  const handleSuccess = async () => {
    setShowForm(false);
    const token = await getUserIdToken();
    if (token) {
      const updatedPosts = await fetchBlogPosts(userId, token);
      setPosts(updatedPosts);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        variant="contained"
        onClick={() => setShowForm(!showForm)}
        sx={{ backgroundColor: '#1976d2' }}
      >
        {showForm ? 'Cancel' : 'Create Blog Post'}
      </Button>
      {showForm && (
        <CreatePostForm
          hideGlobal
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  );
}
// File: components/CreatePostForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPost } from '../app/actions';
import { getUserIdToken } from '../lib/authUtils';
import { Box, TextField, Button, CircularProgress, Alert, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { useAuth } from './AuthProvider';

interface CreatePostFormProps {
  onSuccess?: () => void;
  hideGlobal?: boolean;
}

export default function CreatePostForm({ onSuccess, hideGlobal = false }: CreatePostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).slice(0, 2 - images.length);
      setImages([...images, ...newImages]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!user) {
      setMessage('You must be logged in to create a post.');
      setLoading(false);
      router.push('/login');
      return;
    }

    try {
      const idToken = await getUserIdToken();
      if (!idToken) {
        throw new Error('Failed to authenticate. Please log in again.');
      }

      await createPost({
        title,
        content,
        isGlobal: hideGlobal ? false : isGlobal,
        idToken,
        images,
      });

      setMessage('Post created successfully!');
      setTitle('');
      setContent('');
      setIsGlobal(false);
      setImages([]);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setMessage(err.message || 'Failed to create post. Check console.');
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
      <Typography variant="h6">Create New Post</Typography>
      {message && <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mt: 2 }}>{message}</Alert>}
      <TextField
        label="Title"
        fullWidth
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <TextField
        label="Content"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        style={{ marginTop: '16px', marginBottom: '16px' }}
      />
      <Typography variant="caption" display="block" gutterBottom>
        {images.length} of 2 images selected
      </Typography>
      {!hideGlobal && (
        <FormControlLabel
          control={<Checkbox checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} />}
          label="Global Post (Admin Only)"
          disabled={authLoading || !user}
        />
      )}
      <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Create Post'}
      </Button>
    </Box>
  );
}
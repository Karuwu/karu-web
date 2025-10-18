// File: components/CreatePostForm.tsx
'use client';

import { useState } from 'react';
import { createPost } from '../app/actions'; // Import the Server Action
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';

export default function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await createPost({ title, content });
      setMessage('Post created successfully!');
      setTitle(''); // Clear the form
      setContent('');
    } catch (err) {
      setMessage('Failed to create post. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
      <Typography variant="h5">Create New Post</Typography>
      <TextField
        label="Post Title"
        fullWidth
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <TextField
        label="Post Content"
        fullWidth
        margin="normal"
        multiline
        rows={10}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Publish Post'}
      </Button>
      {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
    </Box>
  );
}

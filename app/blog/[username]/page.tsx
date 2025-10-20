import { Box, Typography, Card, CardContent, CardMedia } from '@mui/material';
import { db } from '../../../lib/firebase';
import { fetchBlogPosts } from '../../../app/actions';
import BlogControls from '../../../components/BlogControls';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  excerpt?: string;
  userId: string;
  imageUrls?: string[];
}

export default async function UserBlogPage({ params, searchParams }: { params: { username: string }, searchParams: { idToken?: string } }) {
  const { username } = params;
  const idToken = searchParams.idToken || '';

  const userSnapshot = await db.collection('users').where('username', '==', username).get();
  if (userSnapshot.empty) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Typography variant="h5" gutterBottom>User not found</Typography>
      </Box>
    );
  }

  const userDoc = userSnapshot.docs[0];
  const userData = userDoc.data();
  const uid = userDoc.id;

  if (userData.isPrivate) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Typography variant="h5" gutterBottom>This user's profile is private</Typography>
      </Box>
    );
  }

  let posts: BlogPost[] = [];
  if (idToken) {
    try {
      posts = await fetchBlogPosts(uid, idToken);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>{username}'s Blog Posts</Typography>
      <BlogControls userId={uid} idToken={idToken} />
      {posts.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {posts.map((post: BlogPost) => (
            <Card key={post.id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{post.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {post.createdAt?.toDate().toLocaleDateString() || 'Unknown'}
                </Typography>
                <Typography variant="body1">{post.excerpt}</Typography>
                {post.imageUrls && post.imageUrls.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {post.imageUrls.map((url, index) => (
                      <CardMedia
                        key={index}
                        component="img"
                        image={url}
                        alt={`Blog post image ${index + 1}`}
                        sx={{ width: 100, height: 100, objectFit: 'cover' }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography variant="body1">No blog posts found for this user.</Typography>
      )}
    </Box>
  );
}
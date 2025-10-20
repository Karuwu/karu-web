// app/page.tsx

import React from 'react';
import Image from 'next/image';
import {getGlobalPosts} from '../lib/BlogPosts';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Timestamp } from 'firebase-admin/firestore';

export default async function Home() {
  const blogPosts = await getGlobalPosts();

  const formatDate = (createdAt: Timestamp | string) => {
    if (createdAt instanceof Timestamp) {
      return createdAt.toDate().toLocaleDateString();
    }
    return createdAt || 'Recent';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ 
        fontWeight: 'bold', 
        color: 'text.primary',
        mb: 4
      }}>
        Welcome to Karu Web
      </Typography>
      
      {/* Main Content */}
      <Box component="main" sx={{ spaceY: 4 }}>
        <Card sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            for taiko purposes
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center', mt: 2 }}>
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Image 
                src="/images/ruhsia stare.png" 
                alt="hi" 
                width={600} 
                height={600}
                style={{ 
                  borderRadius: '8px',
                  width: '100%',
                  height: 'auto'
                }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                (良い子ですか...?)
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Featured Posts Section */}
        <Card sx={{ p: 3, mt: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Featured Posts
          </Typography>
          {blogPosts.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {blogPosts.map((post) => (
                <Card key={post.id} variant="outlined" sx={{ p: 2 }}>
                  <CardContent>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {post.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      {formatDate(post.createdAt)}
                    </Typography>
                    {post.excerpt && (
                      <Typography variant="body1" color="text.secondary">
                        {post.excerpt}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography variant="h6" color="text.secondary">
              No featured posts yet. Check back soon!
            </Typography>
          )}
        </Card>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: 1, borderColor: 'grey.300' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          -karu web 2025
        </Typography>
      </Box>
    </Box>
  );
}
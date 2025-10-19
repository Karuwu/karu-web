// app/page.tsx

import React from 'react';
import Image from 'next/image';
import { getBlogPosts } from '../lib/BlogPosts';
import { Box, Typography, Card, CardContent } from '@mui/material';

export default async function Home() {
  const blogPosts = await getBlogPosts();

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

        {/* Blog Posts Section */}
        {blogPosts.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Latest Blog Posts
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {blogPosts.map((post) => (
                <Card key={post.id} variant="outlined" sx={{ p: 2 }}>
                  <CardContent>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {post.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Recent'}
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
          </Card>
        )}

        {/* No Posts Message */}
        {blogPosts.length === 0 && (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No blog posts yet. Check back soon!
            </Typography>
          </Card>
        )}
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
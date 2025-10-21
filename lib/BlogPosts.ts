import { db } from './firebase';
import { Timestamp } from 'firebase/firestore';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  excerpt?: string;
  userId: string;
}

export const getBlogPosts = async (uid?: string): Promise<BlogPost[]> => {
  if (!db) {
    console.error('Firebase database not initialized');
    return [];
  }

  if (!uid) {
    console.log('No user ID provided, returning empty posts');
    return [];
  }

  try {
    console.log('Querying Firestore subcollection: users/%s/posts', uid);
    const snapshot = await db.collection(`users/${uid}/posts`).get();
    if (snapshot.empty) {
      console.log('No documents found in "posts" subcollection for user:', uid);
      return [];
    }
    const posts: BlogPost[] = snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title as string,
      content: doc.data().content as string,
      createdAt: doc.data().createdAt as string,
      excerpt: doc.data().excerpt as string | undefined,
      userId: doc.data().userId as string,
    }));
    return posts;
  } catch (error: any) {
    console.error('Error fetching posts from Firebase:', {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return [];
  }
};

export const getGlobalPosts = async (): Promise<BlogPost[]> => {
  if (!db) {
    console.error('Firebase database not initialized');
    return [];
  }

  try {
    console.log('Querying Firestore collection: global_posts');
    const snapshot = await db.collection('global_posts').get();
    if (snapshot.empty) {
      console.log('No documents found in "global_posts" collection');
      return [];
    }
    const posts: BlogPost[] = snapshot.docs.map(doc => {
      const data = doc.data();
      const rawCreatedAt = data.createdAt;
      console.log('getGlobalPosts: Raw createdAt:', {
        id: doc.id,
        createdAt: rawCreatedAt,
        type: rawCreatedAt ? typeof rawCreatedAt : 'undefined',
        isTimestampLike: rawCreatedAt && typeof rawCreatedAt === 'object' && '_seconds' in rawCreatedAt && '_nanoseconds' in rawCreatedAt,
      });
      let createdAt = '';
      if (rawCreatedAt && typeof rawCreatedAt === 'object' && '_seconds' in rawCreatedAt && '_nanoseconds' in rawCreatedAt) {
        const seconds = (rawCreatedAt as any)._seconds;
        const nanoseconds = (rawCreatedAt as any)._nanoseconds;
        createdAt = new Date(seconds * 1000 + nanoseconds / 1000000).toISOString();
      } else if (typeof rawCreatedAt === 'string' && rawCreatedAt) {
        createdAt = rawCreatedAt;
      }
      return {
        id: doc.id,
        title: data.title as string,
        content: data.content as string,
        createdAt,
        excerpt: data.excerpt as string | undefined,
        userId: data.userId as string,
      };
    });
    console.log('getGlobalPosts: Fetched posts:', posts.map(post => ({
      id: post.id,
      title: post.title,
      createdAt: post.createdAt,
    })));
    return posts;
  } catch (error: any) {
    console.error('Error fetching global posts from Firebase:', {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return [];
  }
};
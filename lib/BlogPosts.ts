import { db } from './firebase';
import { Timestamp } from 'firebase/firestore';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  excerpt?: string;
  userId: string;
  imageUrls?: string[];
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
      createdAt: doc.data().createdAt as Timestamp,
      excerpt: doc.data().excerpt as string | undefined,
      userId: uid,
      imageUrls: doc.data().imageUrls as string[] | undefined,
    }));
    return posts;
  } catch (error) {
    console.error('Error fetching posts from Firebase:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any).code,
      details: (error as any).details,
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
    const posts: BlogPost[] = snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title as string,
      content: doc.data().content as string,
      createdAt: doc.data().createdAt as Timestamp,
      excerpt: doc.data().excerpt as string | undefined,
      userId: doc.data().userId as string,
      imageUrls: doc.data().imageUrls as string[] | undefined,
    }));
    return posts;
  } catch (error) {
    console.error('Error fetching global posts from Firebase:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any).code,
      details: (error as any).details,
    });
    return [];
  }
};
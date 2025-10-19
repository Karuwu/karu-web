import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase'; // Adjust path to your firebase config
import { Timestamp } from 'firebase-admin/firestore';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: any; // Firestore timestamp
  excerpt?: string;
}

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  if (!db) {
    console.error('Firebase database not initialized');
    return [];
  }

  try {
    console.log('Querying Firestore collection: posts');
    const snapshot = await db.collection('posts').get();
    if (snapshot.empty) {
      console.log('No documents found in "scores" collection');
      return [];
    }
    const posts: BlogPost[] = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title as string,
        content: doc.data().content as string,
        createdAt: doc.data().createdAt as Timestamp,
        excerpt: doc.data().content as string,
    }));
    return posts;
  } catch (error) {
    console.error('Error fetching scores from Firebase:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any).code,
      details: (error as any).details,
    });
    return [];
  }
};
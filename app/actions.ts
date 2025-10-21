'use server';

import { db, auth } from '../lib/firebase';
import { Timestamp } from 'firebase-admin/firestore';

interface CreatePostParams {
  title: string;
  content: string;
  isGlobal: boolean;
  idToken: string;
}

interface CreateScoreParams {
  song: string;
  difficulty: string;
  score: number;
  greats: number;
  goods: number;
  bads: number;
  isFullCombo: boolean;
  hits?: number;
  maxCombo?: number;
  idToken: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  excerpt?: string;
  userId: string;
  imageUrls?: string[];
}

interface Score {
  id: string;
  song: string;
  difficulty: string;
  score: number;
  greats: number;
  goods: number;
  bads: number;
  isFullCombo: boolean;
  hits?: number;
  maxCombo?: number;
  dateAchieved: string;
  userId: string;
}

export async function createPost({ title, content, isGlobal, idToken }: CreatePostParams) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (isGlobal && (!userDoc.exists || !userDoc.data()?.isAdmin)) {
      throw new Error('Only admins can create global posts');
    }

    const postData = {
      title,
      content,
      createdAt: Timestamp.now(),
      userId: uid,
      imageUrls: [],
    };

    if (isGlobal) {
      await db.collection('global_posts').add(postData);
    } else {
      await db.collection(`users/${uid}/posts`).add(postData);
    }
  } catch (error: any) {
    console.error('Error creating post:', {
      message: error.message,
      code: error.code,
    });
    throw new Error(error.message || 'Failed to create post');
  }
}

export async function createScore({
  song,
  difficulty,
  score,
  greats,
  goods,
  bads,
  isFullCombo,
  hits,
  maxCombo,
  idToken,
}: CreateScoreParams) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    if (!song || !difficulty || !Number.isInteger(score) || !Number.isInteger(greats) ||
        !Number.isInteger(goods) || !Number.isInteger(bads)) {
      throw new Error('Required fields must be valid');
    }

    const scoreData = {
      song,
      difficulty,
      score,
      greats,
      goods,
      bads,
      isFullCombo,
      hits: Number.isInteger(hits) ? hits : null,
      maxCombo: Number.isInteger(maxCombo) ? maxCombo : null,
      dateAchieved: Timestamp.now(),
      userId: uid,
    };

    await db.collection(`users/${uid}/scores`).add(scoreData);
  } catch (error: any) {
    console.error('Error creating score:', {
      message: error.message,
      code: error.code,
    });
    throw new Error(error.message || 'Failed to create score');
  }
}

export async function fetchTopScores(uid: string, idToken?: string) {
  try {
    if (idToken) {
      await auth.verifyIdToken(idToken);
    }
    const snapshot = await db.collection(`users/${uid}/scores`).get();
    if (snapshot.empty) {
      console.log('fetchTopScores: No scores found for UID:', uid);
      return [];
    }
    const scores: Score[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        song: data.song as string,
        difficulty: data.difficulty as string,
        score: data.score as number,
        greats: data.greats as number,
        goods: data.goods as number,
        bads: data.bads as number,
        isFullCombo: data.isFullCombo as boolean,
        hits: data.hits as number | undefined,
        maxCombo: data.maxCombo as number | undefined,
        dateAchieved: data.dateAchieved ? (data.dateAchieved as Timestamp).toDate().toISOString() : '',
        userId: uid,
      };
    });
    console.log('fetchTopScores: Fetched scores:', scores);
    return scores;
  } catch (error: any) {
    console.error('fetchTopScores: Error fetching scores:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(error.message || 'Failed to fetch scores');
  }
}

export async function fetchBlogPosts(uid: string, idToken?: string) {
  try {
    if (idToken) {
      await auth.verifyIdToken(idToken);
    }
    const snapshot = await db.collection(`users/${uid}/posts`).get();
    if (snapshot.empty) {
      console.log('fetchBlogPosts: No posts found for UID:', uid);
      return [];
    }
    const posts: BlogPost[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title as string,
        content: data.content as string,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : '',
        excerpt: data.excerpt as string | undefined,
        userId: uid,
        imageUrls: data.imageUrls as string[] | undefined,
      };
    });
    console.log('fetchBlogPosts: Fetched posts:', posts);
    return posts;
  } catch (error: any) {
    console.error('fetchBlogPosts: Error fetching posts:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(error.message || 'Failed to fetch posts');
  }
}

export async function fetchGlobalPosts(idToken?: string) {
  try {
    if (idToken) {
      await auth.verifyIdToken(idToken);
    }
    const snapshot = await db.collection('global_posts').get();
    if (snapshot.empty) {
      console.log('fetchGlobalPosts: No global posts found');
      return [];
    }
    const posts: BlogPost[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title as string,
        content: data.content as string,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : '',
        excerpt: data.excerpt as string | undefined,
        userId: data.userId as string,
        imageUrls: data.imageUrls as string[] | undefined,
      };
    });
    console.log('fetchGlobalPosts: Fetched posts:', posts);
    return posts;
  } catch (error: any) {
    console.error('fetchGlobalPosts: Error fetching global posts:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(error.message || 'Failed to fetch global posts');
  }
}

export async function checkAdmin(idToken: string) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    const isAdmin = userDoc.exists && userDoc.data()?.isAdmin === true;
    console.log('checkAdmin: UID:', uid, 'isAdmin:', isAdmin);
    return isAdmin;
  } catch (error: any) {
    console.error('Error checking admin status:', {
      message: error.message,
      code: error.code,
    });
    return false;
  }
}
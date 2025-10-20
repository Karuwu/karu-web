'use server';

import { db, auth } from '../lib/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

interface CreatePostParams {
  title: string;
  content: string;
  isGlobal: boolean;
  idToken: string;
  images?: File[];
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
  createdAt: Timestamp;
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
  dateAchieved?: Timestamp;
  userId: string;
}

export async function createPost({ title, content, isGlobal, idToken, images }: CreatePostParams) {
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

    const imageUrls: string[] = [];
    if (images && images.length > 0) {
      const bucket = getStorage().bucket();
      for (const image of images.slice(0, 2)) {
        const file = bucket.file(`users/${uid}/posts/${Date.now()}_${image.name}`);
        await file.save(Buffer.from(await image.arrayBuffer()), {
          contentType: image.type,
        });
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2500',
        });
        imageUrls.push(url);
      }
    }

    const postData = {
      title,
      content,
      createdAt: Timestamp.now(),
      userId: uid,
      imageUrls,
    };

    if (isGlobal) {
      await db.collection('global_posts').add(postData);
    } else {
      await db.collection(`users/${uid}/posts`).add(postData);
    }
  } catch (error: any) {
    console.error('Error creating post:', error);
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
    console.error('Error creating score:', error);
    throw new Error(error.message || 'Failed to create score');
  }
}

export async function fetchTopScores(uid: string, idToken: string) {
  try {
    await auth.verifyIdToken(idToken);
    const snapshot = await db.collection(`users/${uid}/scores`).get();
    if (snapshot.empty) {
      return [];
    }
    const scores: Score[] = snapshot.docs.map(doc => ({
      id: doc.id,
      song: doc.data().song as string,
      difficulty: doc.data().difficulty as string,
      score: doc.data().score as number,
      greats: doc.data().greats as number,
      goods: doc.data().goods as number,
      bads: doc.data().bads as number,
      isFullCombo: doc.data().isFullCombo as boolean,
      hits: doc.data().hits as number | undefined,
      maxCombo: doc.data().maxCombo as number | undefined,
      dateAchieved: doc.data().dateAchieved as Timestamp | undefined,
      userId: uid,
    }));
    return scores;
  } catch (error: any) {
    console.error('Error fetching scores:', error);
    throw new Error(error.message || 'Failed to fetch scores');
  }
}

export async function fetchBlogPosts(uid: string, idToken: string) {
  try {
    await auth.verifyIdToken(idToken);
    const snapshot = await db.collection(`users/${uid}/posts`).get();
    if (snapshot.empty) {
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
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    throw new Error(error.message || 'Failed to fetch posts');
  }
}

export async function fetchGlobalPosts(idToken?: string) {
  if (idToken) {
    try {
      await auth.verifyIdToken(idToken);
    } catch (error: any) {
      console.error('Error verifying token for global posts:', error);
      throw new Error(error.message || 'Failed to verify token');
    }
  }
  const snapshot = await db.collection('global_posts').get();
  if (snapshot.empty) {
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
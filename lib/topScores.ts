// File: lib/topScores.ts
import { db } from './firebase';
import { Timestamp } from 'firebase-admin/firestore';

export interface Score {
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

export const getTopScores = async (uid?: string): Promise<Score[]> => {
  if (!db) {
    console.error('Firebase database not initialized');
    return [];
  }

  if (!uid) {
    console.log('No user ID provided, returning empty scores');
    return [];
  }

  try {
    console.log('Querying Firestore subcollection: users/%s/scores', uid);
    const snapshot = await db.collection(`users/${uid}/scores`).get();
    if (snapshot.empty) {
      console.log('No documents found in "scores" subcollection for user:', uid);
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
      hits: doc.data().hits as number,
      maxCombo: doc.data().maxCombo as number,
      dateAchieved: doc.data().dateAchieved as Timestamp,
      userId: uid,
    }));
    return scores;
  } catch (error) {
    console.error('Error fetching scores from Firebase:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any).code,
      details: (error as any).details,
    });
    return [];
  }
};

export const getScoreById = async (uid: string, id: string): Promise<Score | null> => {
  if (!db) {
    console.error('Firebase database not initialized');
    return null;
  }
  try {
    console.log('Fetching score with ID:', id, 'for user:', uid);
    const doc = await db.collection(`users/${uid}/scores`).doc(id).get();
    if (!doc.exists) {
      console.log('No score found for ID:', id, 'user:', uid);
      return null;
    }
    const data = doc.data();
    const score: Score = {
      id: doc.id,
      song: data?.song as string,
      difficulty: data?.difficulty as string,
      score: data?.score as number,
      greats: data?.greats as number,
      goods: data?.goods as number,
      bads: data?.bads as number,
      isFullCombo: data?.isFullCombo as boolean,
      hits: data?.hits as number,
      maxCombo: data?.maxCombo as number,
      dateAchieved: data?.dateAchieved as Timestamp,
      userId: uid,
    };
    console.log('Mapped score:', score);
    return score;
  } catch (error) {
    console.error('Error fetching score:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any).code,
      details: (error as any).details,
    });
    return null;
  }
};
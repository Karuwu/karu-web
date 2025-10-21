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
  dateAchieved?: string;
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
      dateAchieved: doc.data().dateAchieved as string,
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

export async function getScoreById(id: string): Promise<Score | null> {
  try {
    const usersSnapshot = await db.collection('users').get();
    for (const userDoc of usersSnapshot.docs) {
      const scoreSnapshot = await db.collection(`users/${userDoc.id}/scores`).doc(id).get();
      if (scoreSnapshot.exists) {
        const data = scoreSnapshot.data();
        return {
          id: scoreSnapshot.id,
          song: data?.song as string,
          difficulty: data?.difficulty as string,
          score: data?.score as number,
          greats: data?.greats as number,
          goods: data?.goods as number,
          bads: data?.bads as number,
          isFullCombo: data?.isFullCombo as boolean,
          hits: data?.hits as number | undefined,
          maxCombo: data?.maxCombo as number | undefined,
          dateAchieved: data?.dateAchieved ? (data.dateAchieved as Timestamp).toDate().toISOString() : '',
          userId: data?.userId as string,
        };
      }
    }
    return null;
  } catch (error: any) {
    console.error('getScoreById: Error fetching score:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return null;
  }
};
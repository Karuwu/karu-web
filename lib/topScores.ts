// File: lib/data.ts
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
  dateAchieved?: Timestamp | string;
}

export const getTopScores = async (): Promise<Score[]> => {
  if (!db) {
    console.error('Firebase database not initialized');
    return [];
  }

  try {
    console.log('Querying Firestore collection: scores');
    const snapshot = await db.collection('scores').get();
    if (snapshot.empty) {
      console.log('No documents found in "scores" collection');
      return [];
    }
    const scores: Score[] = snapshot.docs.map(doc => ({
      id: doc.id,
      song: doc.data().Song as string,
      difficulty: doc.data().Difficulty as string,
      score: doc.data().Score as number,
      greats: doc.data().Greats as number,
      goods: doc.data().Goods as number,
      bads: doc.data().Bads as number,
      isFullCombo: doc.data().isFullCombo as boolean,
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

export const getScoreById = async (id: string): Promise<Score | null> => {
  if (!db) {
    console.error('Firebase database not initialized');
    return null;
  }
  try {
    console.log('Fetching score with ID:', id);
    const doc = await db.collection('scores').doc(id).get();
    if (!doc.exists) {
      console.log('No score found for ID:', id);
      return null;
    }
    const data = doc.data();
    console.log('Raw Firestore data:', data);
    const score: Score = {
      id: doc.id,
      song: data?.Song as string,
      difficulty: data?.Difficulty as string,
      score: data?.Score as number,
      greats: data?.Greats as number,
      goods: data?.Goods as number,
      bads: data?.Bads as number,
      isFullCombo: data?.isFullCombo as boolean,
      hits: data?.Hits as number,
      maxCombo: data?.MaxCombo as number,
      dateAchieved: data?.DateAchieved as Timestamp | string,
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
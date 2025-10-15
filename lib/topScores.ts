// File: lib/data.ts
import { db } from './firebase';

export interface Score {
  id: string;
  song: string;
  difficulty: string;
  score: number;
  greats: number;
  goods: number;
  bads: number;
  isFullCombo: boolean;
}

export const getTopScores = async (): Promise<Score[]> => {
  if (!db) {
    console.error('Firebase database not initialized');
    return [];
  }

  try {
    console.log('Querying Firestore collection: scores'); // Debug log
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

// NEW FUNCTION to get a single document by its ID
export const getScoreById = async (id: string): Promise<Score | null> => {
  console.log(`Fetching score with ID: ${id}`);
  
  // 1. Get a reference to the specific document
  const scoreDocRef = db.collection('scores').doc(id);
  
  // 2. Fetch the document's data
  const scoreDoc = await scoreDocRef.get();

  // 3. Check if the document actually exists
  if (!scoreDoc.exists) {
    console.log('No such document!');
    return null; // Return null if not found
  }

  // 4. Return the combined data and ID
  const data = scoreDoc.data()!; // The '!' tells TypeScript we are sure it exists
  return {
    id: scoreDoc.id,
    song: data.Song,
    difficulty: data.Difficulty,
    score: data.Score,
    greats: data.Greats,
    goods: data.Goods,
    bads: data.Bads,
    isFullCombo: data.isFullCombo,
  };
};

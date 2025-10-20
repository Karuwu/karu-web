'use client';

import { auth } from './firebase-client';
import { getIdToken } from 'firebase/auth';

export async function getUserIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    console.error('No user is currently signed in.');
    return null;
  }
  try {
    const token = await getIdToken(user, true); // Force refresh token
    console.log('ID token retrieved successfully:', token.substring(0, 10) + '...');
    return token;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}
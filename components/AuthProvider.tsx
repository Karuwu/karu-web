// File: components/AuthProvider.tsx
'use client';

import { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing Firebase auth listener');
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('AuthProvider: onAuthStateChanged fired', { user: !!firebaseUser, userId: firebaseUser?.uid });
      setUser(firebaseUser);
      setLoading(false);
    }, (error) => {
      console.error('AuthProvider: onAuthStateChanged error', error);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
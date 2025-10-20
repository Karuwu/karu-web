'use client';

import { useAuth } from '../components/AuthProvider';
import { getUserIdToken } from '../lib/authUtils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import AuthProvider from '../components/AuthProvider';
import { auth } from '../lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { user: contextUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState(contextUser);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Layout: Auth context state:', { contextUser: !!contextUser, userId: contextUser?.uid, authLoading });
    // Fallback to direct Firebase auth check
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Layout: onAuthStateChanged fired', { user: !!firebaseUser, userId: firebaseUser?.uid });
      setUser(firebaseUser);
      setLoading(false);
    }, (error) => {
      console.error('Layout: onAuthStateChanged error', error);
      setLoading(false);
    });

    if (contextUser && !authLoading) {
      getUserIdToken().then(token => {
        console.log('Layout: ID token fetched:', token ? token.substring(0, 10) + '...' : null);
        if (token) {
          document.cookie = `auth-token=${token}; path=/; SameSite=Strict`;
          setIdToken(token);
        } else {
          document.cookie = `auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          setIdToken(null);
        }
      });
    } else if (!authLoading) {
      document.cookie = `auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      setIdToken(null);
    }

    return () => unsubscribe();
  }, [contextUser, authLoading]);

  const navItems = user && !loading
    ? [
        { label: 'Home', href: '/' },
        { label: 'Score List', href: '/score_list' },
        { label: 'Blog', href: '/blog' },
        { label: 'Game', href: '/game' },
        { label: 'Settings', href: '/settings' },
      ]
    : [
        { label: 'Home', href: '/' },
        { label: 'Login', href: '/login' },
      ];

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <header className="text-center py-6 border-b border-gray-200">
            <nav className="mb-4">
              <div className="flex justify-center flex-wrap text-sm sm:text-base">
                {navItems.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <Link
                      href={item.href}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      {...(idToken ? { 'data-id-token': idToken } : {})}
                    >
                      {item.label}
                    </Link>
                    {index < navItems.length - 1 && <span className="mx-4">{'//'}</span>}
                  </div>
                ))}
              </div>
            </nav>
          </header>
          <main className="px-4 mt-8" suppressHydrationWarning>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
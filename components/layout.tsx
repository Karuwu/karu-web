'use client';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {

  return (
    <div>
      <header className="text-center mb-12">
        
        <nav className="mb-8">
          <div className="flex justify-center space-x-6">
            <a href="/" className="text-blue-600 hover:text-blue-800 font-medium"> Home</a>
            <span> //</span>
            <a href="/score_list" className="text-blue-600 hover:text-blue-800 font-medium"> Score List</a>
            <span> //</span>
            <a href="/blog" className="text-blue-600 hover:text-blue-800 font-medium"> Blog</a>
            <span> //</span>
            <a href="/test" className="text-blue-600 hover:text-blue-800 font-medium"> Test</a>
          </div>
        </nav>
      </header>
      <main suppressHydrationWarning>{children}</main>
    </div>
  );
}


import Link from 'next/link';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
        <header className="text-center mb-12 py-6 border-b border-gray-200">
          <nav className="mb-4">
            <div className="flex justify-center flex-wrap gap-3 text-sm sm:text-base">
              <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                Home
              </Link>
              <span>//</span>
              <Link href="/score_list" className="text-blue-600 hover:text-blue-800 font-medium">
                Score List
              </Link>
              <span>//</span>
              <Link href="/blog" className="text-blue-600 hover:text-blue-800 font-medium">
                Blog
              </Link>
              <span>//</span>
              <Link href="/test" className="text-blue-600 hover:text-blue-800 font-medium">
                Test
              </Link>
              <span>//</span>
              <Link href="/test2" className="text-blue-600 hover:text-blue-800 font-medium">
                Test2
              </Link>
            </div>
          </nav>
        </header>

        <main suppressHydrationWarning className="px-4">
          {children}
        </main>
    </html>
  );
}

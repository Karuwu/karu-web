// app/not-found.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#1a1a2e] text-white text-center p-6">
      <h1 className="text-3xl md:text-5xl font-bold mb-6">
        Don-chan can&apos;t find this page!
      </h1>
      <div className="relative w-128 h-128 md:w-1000 md:h-90">
        <Image
          src="/images/sleeping don.png"
          alt="Don-chan sad"
          fill
          className="object-contain"
          priority
        />
      </div>
      <Link href="/score_list" className="text-[#1976d2] hover:underline mt-6">
        Back to Scores
      </Link>
    </main>
  );
}
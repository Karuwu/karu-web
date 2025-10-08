import Layout from '@/components/layout';
import Image from 'next/image'
export default function Score() {
  return (

    
<Layout>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Recent Scores</h1>
        
<main className="min-h-screen flex items-center justify-center bg-slate-50">

  <div className="absolute inset-0 flex items-center justify-center">
<div className="flex flex-col items-center justify-center min-h-screen text-center gap-4">
  <p className="text-gray-600">
    Post score with result screen
  </p>

  <Image
    src="/images/IMG_7146.png"
    alt="monochrome voice"
    width={460}
    height={900}
    className="rounded-lg"
  />

  <p className="text-gray-600">
Monochrome Voice with only 51 good !
very hard chart but only took me 3 tries to full combo

  </p>
</div>
  </div>
</main>

        <div className="mt-6">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </a>
        </div>
      </div>
    </Layout>
  );
}

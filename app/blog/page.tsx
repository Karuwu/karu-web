import Image from 'next/image'

export default function Blog() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 z-20 relative">Recent Scores</h1>

      <main className="min-h-screen flex items-center justify-center bg-slate-50 relative">
        {/* overlay placed behind via z-0 */}
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          <div className="flex flex-col items-center justify-center min-h-screen text-center gap-4">
            <p className="text-gray-600">Post score with result screen</p>
            <Image
              src="/images/IMG_7146.png"
              alt="monochrome voice"
              width={460}
              height={900}
              className="rounded-lg"
              priority={false}
            />
            <p className="text-gray-600">
              Monochrome Voice with only 51 good ! very hard chart but only took me 3 tries to full combo
            </p>
          </div>
        </div>

        {/* Actual page content that sits above the overlay */}
        <div className="relative z-10 w-full">
          {/* If you want header content inside main, put it here */}
        </div>
      </main>

      <div className="mt-6">
        <a href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}

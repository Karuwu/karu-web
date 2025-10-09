// pages/index.tsx
import Image from 'next/image';


export default function Home() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Karu Web</h1>
      
      {/* Main Content */}
      <main className="space-y-8">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 mb-4">
            for taiko purposes
          </p>
          
          <div className="flex flex-row gap-6 items-center">
            <div className="w-1/2">
              <Image 
                src="/images/ruhsia stare.png" 
                alt="hi" 
                width={600} 
                height={600}
                className="rounded-lg"
              />
            </div>
            <div className="w-1/2">
              <p>(良い子ですか...?)</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center mt-12 pt-8 border-t border-gray-300">
        <p className="text-gray-500"><i>-karu web 2025</i></p>
      </footer>
</div>
  );
}
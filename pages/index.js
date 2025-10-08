import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Navigation */}
        <header className="text-center mb-12">
          <nav className="mb-8">
            <div className="flex justify-center space-x-6">
              <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">Home</a> <a> //</a>
              <a href="/page" className="text-blue-600 hover:text-blue-800 font-medium"> Score List</a> <a> //</a>
              <a href="/taiko-insight" className="text-blue-600 hover:text-blue-800 font-medium"> Blog</a> <a> //</a>
              <a href="/test111" className="text-blue-600 hover:text-blue-800 font-medium">  Test</a>
            </div>
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Karu Web</h1>
          
        </header>

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
    </div>
  );
}

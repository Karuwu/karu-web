import Image from 'next/image'
export default function Score() {
  return (

    
    <div className="min-h-screen bg-gray-100 py-8">
        <header className="text-center mb-12">
          <nav className="mb-8">
            <div className="flex justify-center space-x-6">
              <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">Home</a>
              <a> //</a>
              <a href="/taiko-insight" className="text-blue-600 hover:text-blue-800 font-medium"> Scores</a> <a> //</a>
              <a href="/test111" className="text-blue-600 hover:text-blue-800 font-medium">  Test</a>
              
            </div>
          </nav>

          
        </header>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Recent Scores</h1>
        
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


        <div className="mt-6">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}


import Image from 'next/image';
import ImageUploader from '../components/imageupload.js';

export default function Home() {
    return (

        <div className="min-h-screen bg-gray-100 py-8">
        <header className="text-center mb-12">
          <nav className="mb-8">
            <div className="flex justify-center space-x-6">
              <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">Home</a> <a> //</a>
              <a href="/page" className="text-blue-600 hover:text-blue-800 font-medium"> Score List</a> <a> //</a>
              <a href="/taiko-insight" className="text-blue-600 hover:text-blue-800 font-medium"> Blog</a> <a> //</a>
              <a href="/test111" className="text-blue-600 hover:text-blue-800 font-medium">  Test</a>
              
            </div>
          </nav>
        </header>

        {/* Image Uploader Section */}
        <section className="mb-12">
            <ImageUploader />
        </section>

        <div className="mt-6">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </a>
        </div>
    </div>

    );
}

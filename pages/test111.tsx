
import Image from 'next/image';
import ImageUploader from '../components/imageupload';

export default function Home() {
    return (
<div>
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

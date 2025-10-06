
import { useState } from 'react';

export default function ImageUploader() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if it's an image file
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Create a URL for the uploaded image
      const url = URL.createObjectURL(file);
      setUploadedImage(file);
      setImageUrl(url);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setImageUrl('');
    // Clean up the object URL to prevent memory leaks
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Image Upload</h2>
      
      {/* File Upload Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose an image to upload:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: JPEG, PNG, GIF, WebP
        </p>
      </div>

      {/* Display Uploaded Image */}
      {imageUrl && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-800">Uploaded Image</h3>
            <button
              onClick={clearImage}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition duration-200"
            >
              Remove
            </button>
          </div>
          
          <div className="flex flex-col items-center">
            <img
              src={imageUrl}
              alt="Uploaded preview"
              className="max-w-full h-auto max-h-96 rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600 mt-2">
              File: {uploadedImage?.name} ({(uploadedImage?.size / 1024).toFixed(1)} KB)
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!imageUrl && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">How to use:</h3>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>Click "Choose File" above</li>
            <li>Select any image from your computer</li>
            <li>The image will display here instantly</li>
            <li>Images are stored temporarily in your browser</li>
          </ul>
        </div>
      )}
    </div>
  );
}

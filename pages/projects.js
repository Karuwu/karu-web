export default function Projects() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Projects</h1>
        
        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Project One</h2>
            <p className="text-gray-600 mb-4">This is my first project description.</p>
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              In Progress
            </span>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Project Two</h2>
            <p className="text-gray-600 mb-4">This is my second project description.</p>
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Completed
            </span>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Project Three</h2>
            <p className="text-gray-600 mb-4">This is my third project description.</p>
            <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              Planning
            </span>
          </div>
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

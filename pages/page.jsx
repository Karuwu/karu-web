// File: page/page.jsx
import ScoreList from '@/components/ScoreList'; // Adjust path if needed
import Layout from '../components/layout';
import topScores from '../data/topScores'

export default function AboutPage() {
  
  return (
<Layout> 

      <div>
      <h1>My Taiko Journey</h1>
      <ScoreList scores={topScores} />

            <div className="mt-6">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </a>
            </div>
        </div>
      </Layout>
  );
}

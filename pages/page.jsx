// File: app/about/page.jsx
import ScoreList from '@/components/ScoreList'; // Adjust path if needed
export default function AboutPage() {

const topScores = [
  { id: 1, song: 'Gurenge', difficulty: 'Oni', score: 987650, greats: 718 , goods: 62, bads: 0, isFullCombo: true },
  { id: 2, song: 'Natsumatsuri', difficulty: 'Oni', score: 954320, greats: 645 , goods: 77, bads: 4, isFullCombo: false },
  { id: 3, song: 'Senbonzakura', difficulty: 'Hard', score: 899100, greats: 601 , goods: 90, bads: 5, isFullCombo: false },
  { id: 4, song: 'Megalovania', difficulty: 'Oni', score: 1015670, greats: 820, goods: 45, bads: 1, isFullCombo: false },
  { id: 5, song: 'Don’t Say Lazy', difficulty: 'Ura Oni', score: 1200000, greats: 777, goods: 0, bads: 0, isFullCombo: true },
];


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
              


      <div>
      <h1>My Taiko Journey</h1>
      <ScoreList scores={topScores} />

            <div className="mt-6">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </a>
            </div>
        </div>
      </div>
  );
}

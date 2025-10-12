// app/page.tsx

import React from 'react';
import RhythmGame from '../components/taiko/RhythmGame';

export default function Games() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Rhythm Games
        </h1>
        
        <p className="text-gray-600 mb-8 text-center">
          Test your rhythm and timing skills with our Taiko-style rhythm game!
        </p>

        {/* Game Component */}
        <RhythmGame />

        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            How to Play
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Press <strong>F</strong> for red notes when they reach the circle</li>
            <li>Press <strong>J</strong> for blue notes when they reach the circle</li>
            <li>Try to get Perfect timing for maximum points</li>
            <li>Build combos to increase your score multiplier</li>
            <li>Click "Start Game" to begin and "Reset" to restart</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
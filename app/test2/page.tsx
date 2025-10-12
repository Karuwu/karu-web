'use client'; // Client-side component for interactivity

import { useState, useEffect, useRef } from 'react';

interface Note {
  time: number;
  type: 'red' | 'blue';
  hit: boolean;
}

interface Chart {
  name: string;
  audio: string;
  notes: { time: number; type: 'red' | 'blue' }[];
}

const RhythmGame = () => {
  const [charts] = useState<string[]>(['song1']); // Add more chart filenames here (without .json)
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [chartData, setChartData] = useState<Chart | null>(null);
  const [score, setScore] = useState(0);
  const [judgment, setJudgment] = useState('');
  const [playing, setPlaying] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [startTime, setStartTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load chart data when selected
  useEffect(() => {
    if (selectedChart) {
      fetch(`/charts/${selectedChart}.json`)
        .then((res) => res.json())
        .then((data: Chart) => {
          setChartData(data);
          setNotes(data.notes.map((note) => ({ ...note, hit: false })));
          if (audioRef.current && data.audio) {
            audioRef.current.src = data.audio;
          }
        })
        .catch((err) => console.error('Failed to load chart:', err));
    }
  }, [selectedChart]);

  // Get current time with fallback to system clock
  const getCurrentTime = () => {
    if (audioRef.current && !audioRef.current.paused) {
      return audioRef.current.currentTime * 1000;
    }
    return Date.now() - startTime;
  };

  // Start game
  const startGame = () => {
    if (!chartData) return;
    setScore(0);
    setNotes(chartData.notes.map((note) => ({ ...note, hit: false })));
    setStartTime(Date.now());
    if (audioRef.current && chartData.audio) {
      audioRef.current.play().catch((err) => {
        console.error('Audio play failed:', err);
      });
    }
    setPlaying(true);
  };

  // Handle audio end
  useEffect(() => {
    const handleEnded = () => setPlaying(false);
    const audio = audioRef.current;
    audio?.addEventListener('ended', handleEnded);
    return () => audio?.removeEventListener('ended', handleEnded);
  }, []);

  // Handle key presses for hits
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playing) return;

      let noteType: 'red' | 'blue' | null = null;
      if (e.key === 'f' || e.key === 'j') noteType = 'red';
      if (e.key === 'd' || e.key === 'k') noteType = 'blue';
      if (!noteType) return;

      const currentTime = getCurrentTime();

      // Find closest unhit note of matching type within hit window (150ms)
      let closestNote: Note | null = null;
      let minDiff = Infinity;
      notes.forEach((note) => {
        if (!note.hit && note.type === noteType) {
          const diff = Math.abs(note.time - currentTime);
          if (diff < minDiff && diff < 150) {
            minDiff = diff;
            closestNote = note;
          }
        }
      });

      if (closestNote) {
        closestNote.hit = true;
        let newJudgment = 'miss';
        let scoreAdd = 0;
        if (minDiff < 50) {
          newJudgment = 'perfect';
          scoreAdd = 100;
        } else if (minDiff < 150) {
          newJudgment = 'good';
          scoreAdd = 50;
        }
        setJudgment(newJudgment);
        setScore((prev) => prev + scoreAdd);
        setNotes([...notes]);

        // Clear judgment after 500ms
        setTimeout(() => setJudgment(''), 500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playing, notes]);

  // Animation loop for rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const speed = 0.5; // pixels per ms
    const judgmentX = 100; // Position of judgment area
    const noteRadius = 30;
    const height = canvas.height;
    const width = canvas.width;

    const draw = () => {
      if (!playing) return;

      const currentTime = getCurrentTime();
      ctx.clearRect(0, 0, width, height);

      // Draw judgment area (circle)
      ctx.beginPath();
      ctx.arc(judgmentX, height / 2, noteRadius + 20, 0, Math.PI * 2);
      ctx.strokeStyle = 'black';
      ctx.stroke();

      // Draw notes (scrolling from right to left)
      notes.forEach((note) => {
        if (note.hit) return;
        const posX = judgmentX + (note.time - currentTime) * speed;
        if (posX < 0 || posX > width) return;

        ctx.beginPath();
        ctx.arc(posX, height / 2, noteRadius, 0, Math.PI * 2);
        ctx.fillStyle = note.type;
        ctx.fill();
      });

      // Draw score and judgment
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);
      ctx.fillText(judgment, judgmentX - 50, height / 2 - 50);

      // Check for misses
      let hasMiss = false;
      notes.forEach((note) => {
        if (!note.hit && note.time < currentTime - 150) {
          note.hit = true;
          setJudgment('miss');
          hasMiss = true;
          setTimeout(() => setJudgment(''), 500);
        }
      });
      if (hasMiss) setNotes([...notes]);

      // Check game end
      const maxNoteTime = Math.max(...notes.map((n) => n.time));
      if (notes.every((note) => note.hit) || currentTime > maxNoteTime + 2000 || audioRef.current?.ended) {
        setPlaying(false);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameId);
  }, [playing, notes, score, judgment]);

  if (!selectedChart) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Select a Chart</h1>
        <select
          onChange={(e) => setSelectedChart(e.target.value)}
          style={{ fontSize: '20px', padding: '10px' }}
        >
          <option value="">Choose a song</option>
          {charts.map((chart) => (
            <option key={chart} value={chart}>
              {chart}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Taiko Rhythm Game</h1>
      <canvas ref={canvasRef} width={800} height={400} style={{ border: '1px solid black' }} />
      <audio ref={audioRef} />
      {!playing && (
        <button onClick={startGame} style={{ marginTop: '20px', padding: '10px 20px' }} disabled={!chartData}>
          Start Game
        </button>
      )}
      <p>Controls: F/J for red notes, D/K for blue notes</p>
    </div>
  );
};

export default function TestPage() {
  return <RhythmGame />;
}
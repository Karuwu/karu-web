'use client'; // Client-side component for interactivity

import { useState, useEffect, useRef } from 'react';

interface Note {
  time: number;
  type: 'red' | 'blue' | 'drumroll' | 'balloon';
  hit: boolean;
  endTime?: number; // For drumroll/balloon duration
  requiredHits?: number; // For balloon
  currentHits?: number; // For tracking mash progress
}

interface Chart {
  name: string;
  audio: string;
  bpm: number;
  offset: number;
  time_signature: [number, number];
  subdivision: number;
  balloon: number[];
  bpm_changes: { measure: number; bpm: number }[];
  measures: string[];
}

const RhythmGame = () => {
  // Note: For future scalability, consider a Next.js API route to dynamically list all .json files in /charts
  const [charts] = useState<string[]>(['Natsumatsuri', 'song1']);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [chartData, setChartData] = useState<Chart | null>(null);
  const [score, setScore] = useState(0);
  const [judgment, setJudgment] = useState('');
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [pauseTime, setPauseTime] = useState(0);
  const [perfects, setPerfects] = useState(0);
  const [goods, setGoods] = useState(0);
  const [misses, setMisses] = useState(0);
  const [hits, setHits] = useState(0); // For drumroll and balloon hits
  const [combo, setCombo] = useState(0);
  const [highestCombo, setHighestCombo] = useState(0);
  const [songVolume, setSongVolume] = useState(() => {
    const savedVolume = localStorage.getItem('songVolume');
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });
  const [hitsoundVolume, setHitsoundVolume] = useState(() => {
    const savedVolume = localStorage.getItem('hitsoundVolume');
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });
  const [showResults, setShowResults] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const redHitsoundRef = useRef<HTMLAudioElement>(null);
  const blueHitsoundRef = useRef<HTMLAudioElement>(null);

  // Save song volume to localStorage
  useEffect(() => {
    localStorage.setItem('songVolume', songVolume.toString());
  }, [songVolume]);

  // Save hitsound volume to localStorage
  useEffect(() => {
    localStorage.setItem('hitsoundVolume', hitsoundVolume.toString());
  }, [hitsoundVolume]);

  // Parse TJA-style measures into notes
  const parseNotes = (data: Chart): Note[] => {
    let currentBpm = data.bpm;
    let balloonIndex = 0;
    const notes: Note[] = [];
    let currentTime = data.offset;

    data.measures.forEach((measureStr, measureIndex) => {
      const bpmChange = data.bpm_changes.find((change) => change.measure === measureIndex);
      if (bpmChange) currentBpm = bpmChange.bpm;

      const msPerBeat = 60000 / currentBpm;
      const beatsPerMeasure = (data.time_signature[0] / data.time_signature[1]) * 4;
      const subdivision = measureStr.length / beatsPerMeasure;
      const msPerSlot = msPerBeat / subdivision;

      let i = 0;
      while (i < measureStr.length) {
        const symbol = measureStr[i];
        if (symbol === 'R' || symbol === '1') {
          notes.push({ time: currentTime + i * msPerSlot, type: 'red', hit: false });
          i++;
        } else if (symbol === 'B' || symbol === '2') {
          notes.push({ time: currentTime + i * msPerSlot, type: 'blue', hit: false });
          i++;
        } else if (symbol === 'A' || symbol === '7' || symbol === '8') {
          const startIndex = i;
          let endIndex = i;
          while (endIndex < measureStr.length && (measureStr[endIndex] === 'A' || measureStr[endIndex] === '7' || measureStr[endIndex] === '8' || measureStr[endIndex] === '5')) {
            endIndex++;
          }
          const duration = (endIndex - startIndex) * msPerSlot;
          const type = measureStr[startIndex] === '7' ? 'balloon' : 'drumroll';
          const requiredHits = type === 'balloon' && balloonIndex < data.balloon.length ? data.balloon[balloonIndex++] : undefined;
          notes.push({
            time: currentTime + startIndex * msPerSlot,
            type,
            hit: false,
            endTime: currentTime + endIndex * msPerSlot,
            requiredHits,
            currentHits: 0
          });
          i = endIndex;
        } else {
          i++;
        }
      }
      currentTime += beatsPerMeasure * msPerBeat;
    });
    return notes;
  };

  // Load chart data and reset states
  useEffect(() => {
    if (selectedChart) {
      fetch(`/charts/${selectedChart}.json`)
        .then((res) => res.json())
        .then((data: Chart) => {
          setChartData(data);
          setNotes(parseNotes(data));
          setScore(0);
          setPerfects(0);
          setGoods(0);
          setMisses(0);
          setHits(0);
          setCombo(0);
          setHighestCombo(0);
          setShowResults(false);
          setPlaying(false);
          setPaused(false);
          if (audioRef.current && data.audio) {
            audioRef.current.src = data.audio;
            audioRef.current.volume = songVolume;
          }
        })
        .catch((err) => console.error('Failed to load chart:', err));
    }
  }, [selectedChart]);

  // Update song volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = songVolume;
    }
  }, [songVolume]);

  // Update hitsound volume
  useEffect(() => {
    if (redHitsoundRef.current) {
      redHitsoundRef.current.volume = hitsoundVolume;
    }
    if (blueHitsoundRef.current) {
      blueHitsoundRef.current.volume = hitsoundVolume;
    }
  }, [hitsoundVolume]);

  // Get current time
  const getCurrentTime = () => {
    if (paused) return pauseTime;
    if (audioRef.current && !audioRef.current.paused) {
      return audioRef.current.currentTime * 1000;
    }
    return Date.now() - startTime;
  };

  // Start game
  const startGame = () => {
    if (!chartData) return;
    setScore(0);
    setPerfects(0);
    setGoods(0);
    setMisses(0);
    setHits(0);
    setCombo(0);
    setHighestCombo(0);
    setNotes(parseNotes(chartData));
    setStartTime(Date.now());
    if (audioRef.current && chartData.audio) {
      audioRef.current.play().catch((err) => console.error('Audio play failed:', err));
    }
    // Preload hitsounds to reduce playback delay
    if (redHitsoundRef.current) {
      redHitsoundRef.current.volume = 0;
      redHitsoundRef.current.play().then(() => {
        redHitsoundRef.current?.pause();
        redHitsoundRef.current.volume = hitsoundVolume;
      }).catch((err) => console.error('Red hitsound preload failed:', err));
    }
    if (blueHitsoundRef.current) {
      blueHitsoundRef.current.volume = 0;
      blueHitsoundRef.current.play().then(() => {
        blueHitsoundRef.current?.pause();
        blueHitsoundRef.current.volume = hitsoundVolume;
      }).catch((err) => console.error('Blue hitsound preload failed:', err));
    }
    setPlaying(true);
    setPaused(false);
    setShowResults(false);
  };

  // Reset game
  const resetGame = () => {
    if (!chartData) return;
    setScore(0);
    setPerfects(0);
    setGoods(0);
    setMisses(0);
    setHits(0);
    setCombo(0);
    setHighestCombo(0);
    setNotes(parseNotes(chartData));
    setPlaying(false);
    setPaused(false);
    setShowResults(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Pause or resume game
  const togglePause = () => {
    if (!playing) return;
    if (paused) {
      setStartTime(Date.now() - pauseTime);
      if (audioRef.current) {
        audioRef.current.play().catch((err) => console.error('Audio resume failed:', err));
      }
      setPaused(false);
    } else {
      setPauseTime(getCurrentTime());
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPaused(true);
    }
  };

  // Handle audio end
  useEffect(() => {
    const handleEnded = () => {
      setPlaying(false);
      setShowResults(true);
    };
    const audio = audioRef.current;
    audio?.addEventListener('ended', handleEnded);
    return () => audio?.removeEventListener('ended', handleEnded);
  }, []);

  // Handle key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playing || paused) return;

      let noteType: 'red' | 'blue' | null = null;
      if (e.key === 'f' || e.key === 'j') {
        noteType = 'red';
        if (redHitsoundRef.current) {
          redHitsoundRef.current.currentTime = 0;
          redHitsoundRef.current.play().catch((err) => console.error('Red hitsound play failed:', err));
        }
      }
      if (e.key === 'd' || e.key === 'k') {
        noteType = 'blue';
        if (blueHitsoundRef.current) {
          blueHitsoundRef.current.currentTime = 0;
          blueHitsoundRef.current.play().catch((err) => console.error('Blue hitsound play failed:', err));
        }
      }
      if (!noteType) return;

      const currentTime = getCurrentTime();

      let closestNote: Note | null = null;
      let minDiff = Infinity;
      notes.forEach((note) => {
        if (note.hit) return;
        if (note.type === 'red' || note.type === 'blue') {
          if (note.type === noteType) {
            const diff = Math.abs(note.time - currentTime);
            if (diff < minDiff && diff < 150) {
              minDiff = diff;
              closestNote = note;
            }
          }
        } else if (note.type === 'drumroll' && note.time <= currentTime && currentTime <= (note.endTime || currentTime)) {
          if (noteType === 'red' || noteType === 'blue') {
            note.currentHits = (note.currentHits || 0) + 1;
            setScore((prev) => prev + 10);
            setHits((prev) => prev + 1);
            setJudgment('hit');
            setTimeout(() => setJudgment(''), 200);
            closestNote = note;
          }
        } else if (note.type === 'balloon' && note.time <= currentTime && currentTime <= (note.endTime || currentTime)) {
          if (noteType === 'red') {
            note.currentHits = (note.currentHits || 0) + 1;
            setHits((prev) => prev + 1);
            if (note.currentHits >= (note.requiredHits || 0)) {
              note.hit = true;
              setScore((prev) => prev + 500);
              setJudgment('pop');
              setTimeout(() => setJudgment(''), 500);
            } else {
              setJudgment(`${note.currentHits}/${note.requiredHits}`);
              setTimeout(() => setJudgment(''), 200);
            }
            closestNote = note;
          }
        }
      });

      if (closestNote && (closestNote.type === 'red' || closestNote.type === 'blue')) {
        closestNote.hit = true;
        let newJudgment = 'miss';
        let scoreAdd = 0;
        if (minDiff < 50) {
          newJudgment = 'perfect';
          scoreAdd = 100;
          setPerfects((prev) => prev + 1);
          setCombo((prev) => {
            const newCombo = prev + 1;
            setHighestCombo((prevHighest) => Math.max(prevHighest, newCombo));
            return newCombo;
          });
        } else if (minDiff < 150) {
          newJudgment = 'good';
          scoreAdd = 50;
          setGoods((prev) => prev + 1);
          setCombo((prev) => {
            const newCombo = prev + 1;
            setHighestCombo((prevHighest) => Math.max(prevHighest, newCombo));
            return newCombo;
          });
        }
        setJudgment(newJudgment);
        setScore((prev) => prev + scoreAdd);
        setTimeout(() => setJudgment(''), 500);
      }

      setNotes([...notes]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playing, paused, notes]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const speed = 0.5; // pixels per ms
    const judgmentX = 100;
    const noteRadius = 30;
    const height = canvas.height;
    const width = canvas.width;

    const draw = () => {
      if (!playing || paused) return;

      const currentTime = getCurrentTime();
      ctx.clearRect(0, 0, width, height);

      // Draw judgment area
      ctx.beginPath();
      ctx.arc(judgmentX, height / 2, noteRadius + 20, 0, Math.PI * 2);
      ctx.strokeStyle = 'black';
      ctx.stroke();
      // Draw perfect judgment ring
      ctx.beginPath();
      ctx.arc(judgmentX, height / 2, noteRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'gold';
      ctx.stroke();

      // Draw notes
      notes.forEach((note) => {
        if (note.hit) return;
        const posX = judgmentX + (note.time - currentTime) * speed;
        if (posX < 0 || posX > width) return;

        if (note.type === 'red' || note.type === 'blue') {
          ctx.beginPath();
          ctx.arc(posX, height / 2, noteRadius, 0, Math.PI * 2);
          ctx.fillStyle = note.type;
          ctx.fill();
        } else if (note.type === 'drumroll') {
          const endPosX = judgmentX + ((note.endTime || note.time) - currentTime) * speed;
          if (endPosX < 0) return;
          ctx.fillStyle = 'yellow';
          ctx.fillRect(posX, height / 2 - 20, endPosX - posX, 40);
        } else if (note.type === 'balloon') {
          const scale = Math.min((note.currentHits || 0) / (note.requiredHits || 1), 1) * 20 + noteRadius;
          ctx.beginPath();
          ctx.arc(posX, height / 2, scale, 0, Math.PI * 2);
          ctx.fillStyle = 'orange';
          ctx.fill();
          ctx.fillStyle = 'black';
          ctx.font = '16px Arial';
          ctx.fillText(`${note.currentHits || 0}/${note.requiredHits || 0}`, posX - 20, height / 2 + 5);
        }
      });

      // Draw score, judgment, and combo
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);
      ctx.fillText(judgment, judgmentX - 50, height / 2 - 50);
      ctx.fillText(`Combo: ${combo}`, judgmentX - 50, height / 2 + 70);

      // Check for misses
      let hasMiss = false;
      notes.forEach((note) => {
        if (!note.hit && note.type !== 'drumroll' && note.type !== 'balloon' && note.time < currentTime - 150) {
          note.hit = true;
          setJudgment('miss');
          setMisses((prev) => prev + 1);
          setCombo(0);
          hasMiss = true;
          setTimeout(() => setJudgment(''), 500);
        }
      });
      if (hasMiss) setNotes([...notes]);

      // Check game end
      const maxNoteTime = Math.max(...notes.map((n) => n.endTime || n.time));
      if (notes.every((note) => note.hit) || currentTime > maxNoteTime + 2000 || audioRef.current?.ended) {
        setPlaying(false);
        setPaused(false);
        setShowResults(true);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameId);
  }, [playing, paused, notes, score, judgment, combo]);

  // Reset game for replay
  const resetGameForReplay = () => {
    if (!chartData) return;
    setScore(0);
    setPerfects(0);
    setGoods(0);
    setMisses(0);
    setHits(0);
    setCombo(0);
    setHighestCombo(0);
    setNotes(parseNotes(chartData));
    setPlaying(false);
    setPaused(false);
    setShowResults(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

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

  if (showResults) {
    const accuracy = perfects + goods + misses > 0 
      ? ((perfects + 0.5 * goods) / (perfects + goods + misses) * 100).toFixed(2)
      : "0.00";
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Taiko Rhythm Game - Results</h1>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <div style={{ width: '50%', fontSize: '24px', textAlign: 'left' }}>
            <p>Score: {score}</p>
            <p>Perfects: {perfects}</p>
            <p>Goods: {goods}</p>
            <p>Misses: {misses}</p>
            <p>Accuracy: {accuracy}%</p>
          </div>
          <div style={{ width: '50%', fontSize: '24px', textAlign: 'left' }}>
            <p>Hits: {hits}</p>
            <p>Highest Combo: {highestCombo}</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedChart(null)}
          style={{ margin: '10px', padding: '10px 20px', fontSize: '16px' }}
        >
          Back to Song Select
        </button>
        <button
          onClick={resetGameForReplay}
          style={{ margin: '10px', padding: '10px 20px', fontSize: '16px' }}
        >
          Replay
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Taiko Rhythm Game</h1>
      <canvas ref={canvasRef} width={800} height={400} style={{ border: '1px solid black' }} />
      <audio ref={audioRef} />
      <audio ref={redHitsoundRef} src="/audio/don.ogg" />
      <audio ref={blueHitsoundRef} src="/audio/kat.ogg" />
      <div style={{ marginTop: '20px' }}>
        <label style={{ marginRight: '10px' }}>
          Song Volume:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={songVolume}
            onChange={(e) => setSongVolume(parseFloat(e.target.value))}
            style={{ verticalAlign: 'middle', marginLeft: '5px' }}
          />
        </label>
        <label>
          Hitsound Volume:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={hitsoundVolume}
            onChange={(e) => setHitsoundVolume(parseFloat(e.target.value))}
            style={{ verticalAlign: 'middle', marginLeft: '5px' }}
          />
        </label>
      </div>
      <div style={{ marginTop: '10px' }}>
        {!playing ? (
          <>
            <button onClick={startGame} style={{ margin: '10px', padding: '10px 20px' }} disabled={!chartData}>
              Start Game
            </button>
            <button
              onClick={() => setSelectedChart(null)}
              style={{ margin: '10px', padding: '10px 20px' }}
            >
              Exit to Song Select
            </button>
          </>
        ) : (
          <>
            <button onClick={togglePause} style={{ margin: '10px', padding: '10px 20px' }}>
              {paused ? 'Continue' : 'Pause'}
            </button>
            {paused && (
              <button onClick={resetGame} style={{ margin: '10px', padding: '10px 20px' }}>
                Reset
              </button>
            )}
          </>
        )}
      </div>
      <p>Controls: F/J for red notes, D/K for blue notes, F/J or D/K for drumrolls, F/J for balloons</p>
    </div>
  );
};

export default function TestPage() {
  return <RhythmGame />;
}
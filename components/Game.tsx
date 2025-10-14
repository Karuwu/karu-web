'use client';

import { useState, useEffect, useRef } from 'react';
import { Chart, Note } from '../lib/types';
import { parseNotes, getCurrentTime, handleKeyDown } from '../lib/GameLogic';
import { GameCanvas } from './GameCanvas';

const Game = () => {
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
  const [hits, setHits] = useState(0);
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
      setPauseTime(getCurrentTime(paused, pauseTime, startTime, audioRef));
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
    const keyDownHandler = (e: KeyboardEvent) => {
      handleKeyDown(
        e,
        playing,
        paused,
        notes,
        setNotes,
        setScore,
        setJudgment,
        setPerfects,
        setGoods,
        setMisses,
        setHits,
        setCombo,
        setHighestCombo,
        () => getCurrentTime(paused, pauseTime, startTime, audioRef),
        redHitsoundRef,
        blueHitsoundRef
      );
    };

    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [playing, paused, notes, pauseTime, startTime]);

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
      <GameCanvas
        notes={notes}
        playing={playing}
        paused={paused}
        score={score}
        judgment={judgment}
        combo={combo}
        setJudgment={setJudgment}
        setMisses={setMisses}
        setCombo={setCombo}
        setPlaying={setPlaying}
        setPaused={setPaused}
        setShowResults={setShowResults}
        setNotes={setNotes}
        getCurrentTime={() => getCurrentTime(paused, pauseTime, startTime, audioRef)}
        songName={chartData?.name}
        showResults={showResults}
      />
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

export default Game;
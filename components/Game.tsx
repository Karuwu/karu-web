'use client';

import { useState, useEffect, useRef } from 'react';
import { Chart, Note } from '../lib/types';
import { parseNotes, getCurrentTime, handleKeyDown } from '../lib/GameLogic';
import { GameCanvas } from './GameCanvas';

const Game = () => {
  const [charts, setCharts] = useState<string[]>([]);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [chartData, setChartData] = useState<Chart | null>(null);
  const [score, setScore] = useState(0);
  const [judgment, setJudgment] = useState('');
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [measureTimes, setMeasureTimes] = useState<number[]>([]);
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
  const [lastKeyTimes, setLastKeyTimes] = useState({ f: 0, j: 0, d: 0, k: 0 });
  const audioRef = useRef<HTMLAudioElement>(null);
  const redHitsoundRef = useRef<HTMLAudioElement>(null);
  const blueHitsoundRef = useRef<HTMLAudioElement>(null);
  const bigRedHitsoundRef = useRef<HTMLAudioElement>(null);
  const bigBlueHitsoundRef = useRef<HTMLAudioElement>(null);

  // Fetch available charts from /api/charts
  useEffect(() => {
    fetch('/api/charts')
      .then((res) => res.json())
      .then((data: string[]) => {
        // Assuming data is an array of filenames (e.g., ['Natsumatsuri.json', 'song1.json'])
        const chartNames = data.map((file) => file.replace('.json', ''));
        setCharts(chartNames);
      })
      .catch((err) => console.error('Failed to load chart list:', err));
  }, []);

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
          const { notes, measureTimes } = parseNotes(data);
          setNotes(notes);
          setMeasureTimes(measureTimes);
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
          setLastKeyTimes({ f: 0, j: 0, d: 0, k: 0 });
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
    if (bigRedHitsoundRef.current) {
      bigRedHitsoundRef.current.volume = hitsoundVolume;
    }
    if (bigBlueHitsoundRef.current) {
      bigBlueHitsoundRef.current.volume = hitsoundVolume;
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
  const { notes, measureTimes } = parseNotes(chartData);
  setNotes(notes);
  setMeasureTimes(measureTimes);
  setStartTime(Date.now());
  setLastKeyTimes({ f: 0, j: 0, d: 0, k: 0 });
  if (audioRef.current && chartData.audio) {
    audioRef.current.play().catch((err) => console.error('Audio play failed:', err));
  }
  // Preload hitsounds to reduce playback delay
  if (redHitsoundRef.current) {
    const redAudio = redHitsoundRef.current; // Capture non-null current
    redAudio.volume = 0;
    redAudio.play().then(() => {
      redAudio.pause();
      redAudio.volume = hitsoundVolume;
    }).catch((err) => console.error('Red hitsound preload failed:', err));
  }
  if (blueHitsoundRef.current) {
    const blueAudio = blueHitsoundRef.current; // Capture non-null current
    blueAudio.volume = 0;
    blueAudio.play().then(() => {
      blueAudio.pause();
      blueAudio.volume = hitsoundVolume;
    }).catch((err) => console.error('Blue hitsound preload failed:', err));
  }
  if (bigRedHitsoundRef.current) {
    const bigRedAudio = bigRedHitsoundRef.current; // Capture non-null current
    bigRedAudio.volume = 0;
    bigRedAudio.play().then(() => {
      bigRedAudio.pause();
      bigRedAudio.volume = hitsoundVolume;
    }).catch((err) => console.error('Big red hitsound preload failed:', err));
  }
  if (bigBlueHitsoundRef.current) {
    const bigBlueAudio = bigBlueHitsoundRef.current; // Capture non-null current
    bigBlueAudio.volume = 0;
    bigBlueAudio.play().then(() => {
      bigBlueAudio.pause();
      bigBlueAudio.volume = hitsoundVolume;
    }).catch((err) => console.error('Big blue hitsound preload failed:', err));
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
    const { notes, measureTimes } = parseNotes(chartData);
    setNotes(notes);
    setMeasureTimes(measureTimes);
    setPlaying(false);
    setPaused(false);
    setShowResults(false);
    setLastKeyTimes({ f: 0, j: 0, d: 0, k: 0 });
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
        blueHitsoundRef,
        bigRedHitsoundRef,
        bigBlueHitsoundRef,
        lastKeyTimes
      );
    };

    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [playing, paused, notes, pauseTime, startTime, lastKeyTimes]);

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
    const { notes, measureTimes } = parseNotes(chartData);
    setNotes(notes);
    setMeasureTimes(measureTimes);
    setPlaying(false);
    setPaused(false);
    setShowResults(false);
    setLastKeyTimes({ f: 0, j: 0, d: 0, k: 0 });
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
  
  // Check for full combo (no misses)
  const isFullCombo = misses === 0 && (perfects + goods) > 0;
  
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>{chartData?.name || 'Song'} - Results</h1>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <div style={{ width: '50%', fontSize: '24px', textAlign: 'left' }}>
          {/* Score and Icon Row - Larger */}
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>

            {isFullCombo ? (
              <img 
                src="/images/fc.png" 
                alt="Full Combo" 
                style={{ width: '50px', height: '50px' }}
              />
            ) : (
              <img 
                src="/images/clear.png" 
                alt="Not Full Combo" 
                style={{ width: '50px', height: '50px' }}
              />
            )}

            <span style={{ fontSize: '32px', fontWeight: 'bold', marginRight: '40px' }}>
              Score: {score}
            </span>
            
          </div>
          <p>Perfects: {perfects}</p>
          <p>Goods: {goods}</p>
          <p>Misses: {misses}</p>
          <p>Accuracy: {accuracy}%</p>
        </div>
        <div style={{ width: '50%', fontSize: '24px', textAlign: 'left', marginTop: '80px' }}>
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
        measureTimes={measureTimes}
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
      <audio ref={bigRedHitsoundRef} src="/audio/big_red_hitsound.ogg" />
      <audio ref={bigBlueHitsoundRef} src="/audio/big_blue_hitsound.ogg" />
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
      <p>Controls: F/J for red notes, D/K for blue notes, F+J for big red, D+K for big blue, F/J or D/K for drumrolls, F/J for balloons</p>
    </div>
  );
};

export default Game;
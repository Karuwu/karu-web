import { useEffect, useRef } from 'react';
import { Note } from '../lib/types';

interface GameCanvasProps {
  notes: Note[];
  playing: boolean;
  paused: boolean;
  score: number;
  judgment: string;
  combo: number;
  setJudgment: (judgment: string) => void;
  setMisses: (misses: number | ((prev: number) => number)) => void;
  setCombo: (combo: number | ((prev: number) => number)) => void;
  setPlaying: (playing: boolean) => void;
  setPaused: (paused: boolean) => void;
  setShowResults: (showResults: boolean) => void;
  setNotes: (notes: Note[]) => void;
  getCurrentTime: () => number;
  songName: string | undefined;
  showResults: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  notes,
  playing,
  paused,
  score,
  judgment,
  combo,
  setJudgment,
  setMisses,
  setCombo,
  setPlaying,
  setPaused,
  setShowResults,
  setNotes,
  getCurrentTime,
  songName,
  showResults,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        let posX = judgmentX + (note.time - currentTime) * speed;
        if (note.type === 'balloon' && note.time <= currentTime && currentTime <= (note.endTime || currentTime)) {
          posX = judgmentX; // Fix balloon in judgment circle while active
        }
        if (posX > width) return;

        if (note.type === 'red' || note.type === 'blue') {
          ctx.beginPath();
          ctx.arc(posX, height / 2, noteRadius, 0, Math.PI * 2);
          ctx.fillStyle = note.type;
          ctx.fill();
        } else if (note.type === 'drumroll') {
          const endPosX = judgmentX + ((note.endTime || note.time) - currentTime) * speed;
          if (posX < 0 && endPosX < 0) return;
          ctx.fillStyle = 'yellow';
          ctx.fillRect(Math.max(posX, 0), height / 2 - 20, Math.max(endPosX - Math.max(posX, 0), 0), 40);
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

      // Draw score, judgment, combo, and song name
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);
      ctx.fillText(judgment, judgmentX - 50, height / 2 - 50);
      ctx.fillText(`Combo: ${combo}`, judgmentX - 50, height / 2 + 70);
      if (playing && !showResults && songName) {
        ctx.textAlign = 'right';
        const maxWidth = 200;
        let displayName = songName;
        if (ctx.measureText(songName).width > maxWidth) {
          let truncated = songName;
          while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
          }
          displayName = truncated + '...';
        }
        ctx.fillText(displayName, 790, 30);
        ctx.textAlign = 'left';
      }

      // Check for misses
      let hasMiss = false;
      notes.forEach((note, index) => {
        if (!note.hit && note.type !== 'drumroll' && note.type !== 'balloon' && note.time < currentTime - 108) {
          note.hit = true;
          setJudgment('miss');
          setMisses((prev) => prev + 1);
          setCombo(0);
          hasMiss = true;
          setTimeout(() => setJudgment(''), 500);
          setNotes((prevNotes) => {
            const newNotes = [...prevNotes];
            newNotes[index] = { ...note };
            return newNotes;
          });
        }
      });

      // Check game end
      const maxNoteTime = Math.max(...notes.map((n) => n.endTime || n.time));
      if (notes.every((note) => note.hit) || currentTime > maxNoteTime + 2000) {
        setPlaying(false);
        setPaused(false);
        setShowResults(true);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameId);
  }, [notes, playing, paused, score, judgment, combo, setJudgment, setMisses, setCombo, setPlaying, setPaused, setShowResults, setNotes, getCurrentTime, songName, showResults]);

  return <canvas ref={canvasRef} width={800} height={400} style={{ border: '1px solid black' }} />;
};
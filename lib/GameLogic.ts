import { Note, Chart } from './types';

export const parseNotes = (data: Chart): Note[] => {
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
      } else if (symbol === 'A' || symbol === 'D') {
        const startIndex = i;
        let endIndex = i;
        while (endIndex < measureStr.length && (measureStr[endIndex] === 'A' || measureStr[endIndex] === 'D' || measureStr[endIndex] === '7' || measureStr[endIndex] === '8' || measureStr[endIndex] === '5')) {
          endIndex++;
        }
        const duration = (endIndex - startIndex) * msPerSlot;
        const type = measureStr[startIndex] === 'A' ? 'balloon' : 'drumroll';
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

export const getCurrentTime = (
  paused: boolean,
  pauseTime: number,
  startTime: number,
  audioRef: React.RefObject<HTMLAudioElement>
) => {
  if (paused) return pauseTime;
  if (audioRef.current && !audioRef.current.paused) {
    return audioRef.current.currentTime * 1000;
  }
  return Date.now() - startTime;
};

export const handleKeyDown = (
  e: KeyboardEvent,
  playing: boolean,
  paused: boolean,
  notes: Note[],
  setNotes: (notes: Note[]) => void,
  setScore: (score: number | ((prev: number) => number)) => void,
  setJudgment: (judgment: string) => void,
  setPerfects: (perfects: number | ((prev: number) => number)) => void,
  setGoods: (goods: number | ((prev: number) => number)) => void,
  setMisses: (misses: number | ((prev: number) => number)) => void,
  setHits: (hits: number | ((prev: number) => number)) => void,
  setCombo: (combo: number | ((prev: number) => number)) => void,
  setHighestCombo: (highestCombo: number | ((prev: number) => number)) => void,
  getCurrentTime: () => number,
  redHitsoundRef: React.RefObject<HTMLAudioElement>,
  blueHitsoundRef: React.RefObject<HTMLAudioElement>
) => {
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
  let noteIndex: number | null = null;

  notes.forEach((note, index) => {
    if (note.hit) return;
    if (note.type === 'red' || note.type === 'blue') {
      if (note.type === noteType) {
        const diff = Math.abs(note.time - currentTime);
        if (diff < minDiff && diff < 108) {
          minDiff = diff;
          closestNote = note;
          noteIndex = index;
        }
      }
    } else if (note.type === 'drumroll' && note.time <= currentTime && currentTime <= (note.endTime || currentTime)) {
      if (noteType === 'red' || noteType === 'blue') {
        note.currentHits = (note.currentHits || 0) + 1;
        setScore((prev) => prev + 10);
        setHits((prev) => prev + 1);
        setJudgment(`Hits: ${note.currentHits}`);
        setTimeout(() => setJudgment(''), 200);
        closestNote = note;
        noteIndex = index;
      }
    } else if (note.type === 'balloon' && note.time <= currentTime && currentTime <= (note.endTime || currentTime)) {
      if (noteType === 'red') {
        note.currentHits = (note.currentHits || 0) + 1;
        setHits((prev) => prev + 1);
        if (note.currentHits >= (note.requiredHits || 0)) {
          note.hit = true;
          setScore((prev) => prev + 500);
          setJudgment('pop');
          setTimeout(() => setJudgment(''), 1000);
        } else {
          setJudgment(`Hits Left: ${(note.requiredHits || 0) - (note.currentHits || 0)}`);
          setTimeout(() => setJudgment(''), 200);
        }
        closestNote = note;
        noteIndex = index;
      }
    }
  });

  if (closestNote && (closestNote.type === 'red' || closestNote.type === 'blue')) {
    closestNote.hit = true;
    let newJudgment = 'miss';
    let scoreAdd = 0;
    if (minDiff < 25) {
      newJudgment = 'perfect';
      scoreAdd = 100;
      setPerfects((prev) => prev + 1);
      setCombo((prev) => {
        const newCombo = prev + 1;
        setHighestCombo((prevHighest) => Math.max(prevHighest, newCombo));
        return newCombo;
      });
    } else if (minDiff < 75) {
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
    setScore((prev) => prev + scoreAdd); // Ensure score updates for red/blue notes
    setTimeout(() => setJudgment(''), 500);
  }

  // Update notes array only if necessary
  if (noteIndex !== null && closestNote && (closestNote.type === 'drumroll' || closestNote.type === 'balloon' || closestNote.hit)) {
    setNotes((prevNotes) => {
      const newNotes = [...prevNotes];
      newNotes[noteIndex] = { ...closestNote };
      return newNotes;
    });
  }
};
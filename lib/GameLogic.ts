import { Note, Chart } from './types';

export const parseNotes = (data: Chart): { notes: Note[], measureTimes: number[] } => {
  let currentBpm = data.bpm;
  let balloonIndex = 0;
  const notes: Note[] = [];
  const measureTimes: number[] = [];
  let currentTime = data.offset;
  let pendingStart: { time: number, type: 'drumroll' | 'balloon' } | null = null;

  data.measures.forEach((measureStr, measureIndex) => {
    const bpmChange = data.bpm_changes.find((change) => change.measure === measureIndex);
    if (bpmChange) currentBpm = bpmChange.bpm;

    const msPerBeat = 60000 / currentBpm;
    const beatsPerMeasure = data.time_signature[0]; // Use numerator for beats per measure
    const subdivision = measureStr.length / beatsPerMeasure;
    const msPerSlot = msPerBeat / subdivision;

    measureTimes.push(currentTime);

    let i = 0;
    while (i < measureStr.length) {
      const symbol = measureStr[i];
      if (pendingStart) {
        if (symbol === 'E') {
          const type = pendingStart.type;
          const requiredHits = type === 'balloon' && balloonIndex < data.balloon.length ? data.balloon[balloonIndex++] : undefined;
          notes.push({
            time: pendingStart.time,
            type,
            hit: false,
            endTime: currentTime + i * msPerSlot,
            requiredHits,
            currentHits: 0
          });
          pendingStart = null;
          i++;
        } else {
          i++; // Skip until 'E' or end
        }
      } else {
        if (symbol === 'r') {
          notes.push({ time: currentTime + i * msPerSlot, type: 'red', hit: false });
          i++;
        } else if (symbol === 'b') {
          notes.push({ time: currentTime + i * msPerSlot, type: 'blue', hit: false });
          i++;
        } else if (symbol === 'R') {
          notes.push({ time: currentTime + i * msPerSlot, type: 'big_red', hit: false });
          i++;
        } else if (symbol === 'B') {
          notes.push({ time: currentTime + i * msPerSlot, type: 'big_blue', hit: false });
          i++;
        } else if (symbol === 'D' || symbol === 'A') {
          pendingStart = {
            time: currentTime + i * msPerSlot,
            type: symbol === 'D' ? 'drumroll' : 'balloon'
          };
          i++;
        } else {
          i++;
        }
      }
    }

    if (pendingStart && i === measureStr.length) {
      // End at last position if no 'E' in measure
      const type = pendingStart.type;
      const requiredHits = type === 'balloon' && balloonIndex < data.balloon.length ? data.balloon[balloonIndex++] : undefined;
      notes.push({
        time: pendingStart.time,
        type,
        hit: false,
        endTime: currentTime + i * msPerSlot,
        requiredHits,
        currentHits: 0
      });
      pendingStart = null;
    }

    currentTime += beatsPerMeasure * msPerBeat;
  });

  // Final measure time
  measureTimes.push(currentTime);

  return { notes, measureTimes };
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
  blueHitsoundRef: React.RefObject<HTMLAudioElement>,
  bigRedHitsoundRef: React.RefObject<HTMLAudioElement>,
  bigBlueHitsoundRef: React.RefObject<HTMLAudioElement>,
  lastKeyTimes: { f: number; j: number; d: number; k: number }
) => {
  if (!playing || paused) return;

  const currentTime = getCurrentTime();

  // Update last key press times
  if (e.key === 'f') lastKeyTimes.f = currentTime;
  if (e.key === 'j') lastKeyTimes.j = currentTime;
  if (e.key === 'd') lastKeyTimes.d = currentTime;
  if (e.key === 'k') lastKeyTimes.k = currentTime;

  let noteType: 'red' | 'blue' | null = null;
  let isBigDouble = false;

  if (e.key === 'f' || e.key === 'j') {
    noteType = 'red';
    isBigDouble = Math.abs(lastKeyTimes.f - lastKeyTimes.j) <= 20;
    console.log(`Red input: key=${e.key}, isBigDouble=${isBigDouble}, fTime=${lastKeyTimes.f}, jTime=${lastKeyTimes.j}`);
    if (redHitsoundRef.current && !isBigDouble) {
      redHitsoundRef.current.currentTime = 0;
      redHitsoundRef.current.play().catch((err) => console.error('Red hitsound play failed:', err));
    }
    if (bigRedHitsoundRef.current && isBigDouble) {
      bigRedHitsoundRef.current.currentTime = 0;
      bigRedHitsoundRef.current.play().catch((err) => console.error('Big red hitsound play failed:', err));
    }
  }
  if (e.key === 'd' || e.key === 'k') {
    noteType = 'blue';
    isBigDouble = Math.abs(lastKeyTimes.d - lastKeyTimes.k) <= 20;
    console.log(`Blue input: key=${e.key}, isBigDouble=${isBigDouble}, dTime=${lastKeyTimes.d}, kTime=${lastKeyTimes.k}`);
    if (blueHitsoundRef.current && !isBigDouble) {
      blueHitsoundRef.current.currentTime = 0;
      blueHitsoundRef.current.play().catch((err) => console.error('Blue hitsound play failed:', err));
    }
    if (bigBlueHitsoundRef.current && isBigDouble) {
      bigBlueHitsoundRef.current.currentTime = 0;
      bigBlueHitsoundRef.current.play().catch((err) => console.error('Big blue hitsound play failed:', err));
    }
  }
  if (!noteType) return;

  let closestNote: Note | null = null;
  let minDiff = Infinity;
  let noteIndex: number | null = null;

  // Note selection: Prioritize big notes when isBigDouble=true
  notes.forEach((note, index) => {
    if (note.hit) return;
    if (note.type === 'red' || note.type === 'blue' || note.type === 'big_red' || note.type === 'big_blue') {
      const diff = Math.abs(note.time - currentTime);
      if (diff < minDiff && diff < 108) {
        if (isBigDouble) {
          // Only match big notes when both keys are pressed
          if ((noteType === 'red' && note.type === 'big_red') || (noteType === 'blue' && note.type === 'big_blue')) {
            minDiff = diff;
            closestNote = note;
            noteIndex = index;
          }
        } else {
          // Match regular or big notes with single key press
          if (
            (noteType === 'red' && (note.type === 'red' || note.type === 'big_red')) ||
            (noteType === 'blue' && (note.type === 'blue' || note.type === 'big_blue'))
          ) {
            minDiff = diff;
            closestNote = note;
            noteIndex = index;
          }
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

  if (closestNote && (closestNote.type === 'red' || closestNote.type === 'blue' || closestNote.type === 'big_red' || closestNote.type === 'big_blue')) {
    closestNote.hit = true;
    let newJudgment = 'miss';
    let scoreAdd = 0;
    if (minDiff < 25) {
      newJudgment = 'perfect';
      scoreAdd = ((closestNote.type === 'big_red' && noteType === 'red' && isBigDouble) || (closestNote.type === 'big_blue' && noteType === 'blue' && isBigDouble)) ? 200 : 100;
      setPerfects((prev) => prev + 1);
      setCombo((prev) => {
        const newCombo = prev + 1;
        setHighestCombo((prevHighest) => Math.max(prevHighest, newCombo));
        return newCombo;
      });
    } else if (minDiff < 75) {
      newJudgment = 'good';
      scoreAdd = ((closestNote.type === 'big_red' && noteType === 'red' && isBigDouble) || (closestNote.type === 'big_blue' && noteType === 'blue' && isBigDouble)) ? 100 : 50;
      setGoods((prev) => prev + 1);
      setCombo((prev) => {
        const newCombo = prev + 1;
        setHighestCombo((prevHighest) => Math.max(prevHighest, newCombo));
        return newCombo;
      });
    }
    console.log(`Hit note: type=${closestNote.type}, time=${closestNote.time}, isBigDouble=${isBigDouble}, scoreAdd=${scoreAdd}, judgment=${newJudgment}`);
    setJudgment(newJudgment);
    setScore((prev) => prev + scoreAdd);
    setHits((prev) => prev + 1);
    setTimeout(() => setJudgment(''), 500);
  }

  if (noteIndex !== null && closestNote && (closestNote.type === 'drumroll' || closestNote.type === 'balloon' || closestNote.hit)) {
    setNotes((prevNotes) => {
      const newNotes = [...prevNotes];
      newNotes[noteIndex] = { ...closestNote };
      return newNotes;
    });
  }
};
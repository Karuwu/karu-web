// for taiko game
export interface Note {
  time: number;
  type: 'red' | 'blue' | 'big_red' | 'big_blue' | 'drumroll' | 'balloon';
  hit: boolean;
  endTime?: number; // For drumroll/balloon duration
  requiredHits?: number; // For balloon
  currentHits?: number; // For tracking mash progress
}

export interface Chart {
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
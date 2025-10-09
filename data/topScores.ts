export interface Score {
  id: number;
  song: string;
  difficulty: string;
  score: number;
  greats: number;
  goods: number;
  bads: number;
  isFullCombo: boolean;
}

export const topScores: Score[] = [

  { "id": 1, "song": "Gurenge", "difficulty": "Oni", "score": 987650, "greats": 718, "goods": 62, "bads": 0, "isFullCombo": true },
  { "id": 2, "song": "Natsumatsuri", "difficulty": "Oni", "score": 954320, "greats": 645, "goods": 77, "bads": 4, "isFullCombo": false },
  { "id": 3, "song": "Senbonzakura", "difficulty": "Hard", "score": 899100, "greats": 601, "goods": 90, "bads": 5, "isFullCombo": false },
  { "id": 4, "song": "Megalovania", "difficulty": "Oni", "score": 1015670, "greats": 820, "goods": 45, "bads": 1, "isFullCombo": false },
  { "id": 5, "song": "Don't Say Lazy", "difficulty": "Ura Oni", "score": 1200000, "greats": 777, "goods": 0, "bads": 0, "isFullCombo": true }
]
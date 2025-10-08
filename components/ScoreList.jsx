// File: components/ScoreList.jsx

import styles from './ScoreList.module.css';

export default function ScoreList({ scores }) {
  const iconFor = (difficulty) => `/images/${difficulty.toLowerCase().replace(/\s+/g, '')}.svg`;

  const classForDifficulty = (difficulty) => {
    const key = difficulty.toLowerCase().replace(/\s+/g, ''); // "Ura Oni" → "uraoni"
    if (key === 'oni') return styles.difficultyOni;
    if (key === 'hard') return styles.difficultyHard;
    if (key === 'uraoni') return styles.difficultyUraoni;
    return '';
  };

  return (
    <div>
      <h2>Top Scores</h2>
      <ul className={styles.list}>
        {scores.map((score) => {
          const difficultyClass = classForDifficulty(score.difficulty);
          const iconSrc = iconFor(score.difficulty);

          return (
            <li key={score.id} className={`${styles.scoreItem} ${difficultyClass}`}>
              <div className={styles.row}>
                <div className={styles.iconColumn}>
                  <img
                    src={iconSrc}
                    alt={`${score.difficulty} icon`}
                    className={styles.icon}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
                <div className={styles.contentColumn}>
                  <strong className={styles.song}>{score.song}</strong>
                  <span className={styles.meta}>({score.difficulty})</span>
                  <span className={styles.scoreValue}>- {score.score}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

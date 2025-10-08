// File: components/ScoreList.jsx

import styles from './ScoreList.module.css';

export default function ScoreList({ scores }) {
  const iconForDifficulty = (difficulty) =>
    `/images/${String(difficulty).toLowerCase().replace(/\s+/g, '')}.svg`;

  // choose the correct Full Combo icon (replaces divider icon)
  const iconForFullCombo = (score) => {
    if (score.isFullCombo && (score.goods ?? 0) === 0 && (score.bads ?? 0) === 0) {
      return '/images/donfc.png'; // perfect full combo
    } else if (score.isFullCombo) {
      return '/images/fc.png'; // normal full combo
    } else {
      return '/images/clear.png'; // not full combo
    }
  };

  const classForDifficulty = (difficulty) => {
    const key = String(difficulty).toLowerCase().replace(/\s+/g, '');
    if (key === 'oni') return styles.difficultyOni;
    if (key === 'hard') return styles.difficultyHard;
    if (key === 'uraoni') return styles.difficultyUraoni;
    return '';
  };

  const fmt = (n) => (typeof n === 'number' ? n.toLocaleString() : n);

  return (
    <div>
      <h2>Top Scores</h2>
      <ul className={styles.list}>
        {scores.map((score) => {
          const difficultyClass = classForDifficulty(score.difficulty);
          const diffIcon = iconForDifficulty(score.difficulty);
          const fullComboIcon = iconForFullCombo(score);

          return (
            <li key={score.id} className={`${styles.scoreItem} ${difficultyClass}`}>
              <div className={styles.row}>
                <div className={styles.iconColumn}>
                  <img
                    src={diffIcon}
                    alt={`${score.difficulty} icon`}
                    className={styles.icon}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>

                <div className={styles.contentColumn}>
                  <div className={styles.left}>
                    <strong className={styles.song}>{score.song}</strong>
                    <span className={styles.meta}>({score.difficulty})</span>
                    <span className={styles.scoreValue}>- {fmt(score.score)}</span>

                    {/* vertical bar separator */}
                    <span className={styles.sep} aria-hidden="true">|</span>

                    {/* Full Combo icon (replaces old divider) */}
                    <img
                      src={fullComboIcon}
                      alt={
                        score.isFullCombo
                          ? (score.goods === 0 && score.bads === 0 ? 'Perfect Full Combo' : 'Full Combo')
                          : 'Not Full Combo'
                      }
                      title={
                        score.isFullCombo
                          ? (score.goods === 0 && score.bads === 0 ? 'Perfect Full Combo' : 'Full Combo')
                          : 'Not Full Combo'
                      }
                      className={styles.fcIcon}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>

                  <div className={styles.stats}>
                    <span className={styles.statItem}>Greats: <strong>{fmt(score.greats ?? 0)}</strong></span>
                    <span className={styles.statItem}>Goods: <strong>{fmt(score.goods ?? 0)}</strong></span>
                    <span className={styles.statItem}>Bads: <strong>{fmt(score.bads ?? 0)}</strong></span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

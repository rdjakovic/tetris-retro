import React from "react";
import { getHighScores } from "../../utils/highScoresUtils";

const HighScoresOverlay = ({ isVisible, onClose }) => {
  const highScores = getHighScores();

  if (!isVisible) return null;

  return (
    <div className="high-scores-overlay">
      <div className="high-scores-content">
        <h2>High Scores</h2>
        
        {highScores.length > 0 ? (
          <div className="high-scores-table-container">
            <table className="high-scores-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {highScores.map((entry, index) => (
                  <tr key={index} className={index === 0 ? "top-score" : ""}>
                    <td>{index + 1}</td>
                    <td>{entry.playerName}</td>
                    <td>{entry.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-scores-message">No high scores yet. Play a game!</p>
        )}
        
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default HighScoresOverlay;

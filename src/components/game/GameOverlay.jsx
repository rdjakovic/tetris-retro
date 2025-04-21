import React from "react";

const GameOverlay = ({
  isPaused,
  gameOver,
  score,
  onRestartGame,
  onTogglePause,
  onShowHighScores,
}) => {
  return (
    <>
      {isPaused && !gameOver && (
        <div className="paused-overlay">
          <div className="pause-content">
            <div>Paused</div>
            <button onClick={onTogglePause}>Resume</button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-over-message">
          Game Over!
          <div id="final-score">Score: {score}</div>
          <div className="game-over-buttons">
            <button onClick={onRestartGame}>Restart</button>
            <button className="high-scores-button" onClick={onShowHighScores}>
              High Scores
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GameOverlay;

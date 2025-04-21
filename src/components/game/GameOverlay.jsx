import React from "react";

const GameOverlay = ({
  isPaused,
  gameOver,
  score,
  onRestartGame,
  onTogglePause,
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
          <button onClick={onRestartGame}>Restart</button>
        </div>
      )}
    </>
  );
};

export default GameOverlay;

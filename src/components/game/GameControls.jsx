import React from "react";

const GameControls = ({
  gameStarted,
  gameOver,
  isPaused,
  onStartGame,
  onTogglePause,
  onRestartGame,
  onShowHighScores,
}) => {
  return (
    <div className="game-controls">
      <div className="main-controls">
        {!gameStarted && !gameOver && (
          <button className="start-button" onClick={onStartGame}>
            Start Game
          </button>
        )}

        {gameStarted && !gameOver && (
          <button className="pause-resume-button" onClick={onTogglePause}>
            {isPaused ? "Resume" : "Pause"}
          </button>
        )}

        {gameOver && (
          <button className="restart-button" onClick={onRestartGame}>
            Restart Game
          </button>
        )}
      </div>

      <div className="secondary-controls">
        <button className="high-scores-button" onClick={onShowHighScores}>
          High Scores
        </button>
      </div>
    </div>
  );
};

export default GameControls;

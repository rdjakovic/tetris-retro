import React from 'react';

const GameControls = ({ 
  gameStarted, 
  gameOver, 
  isPaused, 
  onStartGame, 
  onTogglePause, 
  onRestartGame 
}) => {
  return (
    <div className="game-controls">
      {!gameStarted && !gameOver && (
        <button className="start-button" onClick={onStartGame}>
          Start Game
        </button>
      )}
      
      {gameStarted && !gameOver && (
        <button
          className="pause-resume-button"
          onClick={onTogglePause}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      )}
      
      {gameOver && (
        <button className="restart-button" onClick={onRestartGame}>
          Restart Game
        </button>
      )}
    </div>
  );
};

export default GameControls;

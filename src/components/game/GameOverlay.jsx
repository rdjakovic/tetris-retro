import React from 'react';

const GameOverlay = ({ isPaused, gameOver, score, onRestartGame }) => {
  return (
    <>
      {isPaused && !gameOver && <div className="paused-overlay">Paused</div>}
      
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

import React from "react";
import "./TetrisGame.css";
import useTetrisGame from "../hooks/useTetrisGame";
import GameBoard from "./game/GameBoard";
import InfoPanel from "./game/InfoPanel";
import GameControls from "./game/GameControls";
import GameOverlay from "./game/GameOverlay";
import ControlsInfo from "./game/ControlsInfo";

const TetrisGame = () => {
  const {
    board,
    currentPiece,
    nextPiece,
    score,
    level,
    linesCleared,
    gameOver,
    isPaused,
    gameStarted,
    handleTogglePause,
    handleStartGame,
    handleRestartGame,
  } = useTetrisGame();

  return (
    <div className="tetris-container">
      <h1>Tetris</h1>

      <div className="game-area">
        <GameBoard board={board} currentPiece={currentPiece} />

        <div className="side-panel">
          <div className="info-section">
            <InfoPanel
              score={score}
              level={level}
              linesCleared={linesCleared}
              nextPiece={nextPiece}
            />
          </div>
          <div className="controls-section">
            <GameControls
              gameStarted={gameStarted}
              gameOver={gameOver}
              isPaused={isPaused}
              onStartGame={handleStartGame}
              onTogglePause={handleTogglePause}
              onRestartGame={handleRestartGame}
            />
          </div>
        </div>

        <GameOverlay
          isPaused={isPaused}
          gameOver={gameOver}
          score={score}
          onRestartGame={handleRestartGame}
          onTogglePause={handleTogglePause}
        />
      </div>

      <ControlsInfo />
    </div>
  );
};

export default TetrisGame;

import React, { useState } from "react";
import "./TetrisGame.css";
import useTetrisGame from "../hooks/useTetrisGame";
import GameBoard from "./game/GameBoard";
import InfoPanel from "./game/InfoPanel";
import GameControls from "./game/GameControls";
import GameOverlay from "./game/GameOverlay";
import HighScoresOverlay from "./game/HighScoresOverlay";
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
    playerName,
    setPlayerName,
    handleTogglePause,
    handleStartGame,
    handleRestartGame,
  } = useTetrisGame();

  // State for high scores overlay
  const [showHighScores, setShowHighScores] = useState(false);

  // Toggle high scores overlay
  const handleToggleHighScores = () => {
    setShowHighScores((prev) => !prev);
  };

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
              playerName={playerName}
              onPlayerNameChange={setPlayerName}
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
              onShowHighScores={handleToggleHighScores}
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

        <HighScoresOverlay
          isVisible={showHighScores}
          onClose={handleToggleHighScores}
        />
      </div>

      <ControlsInfo />
    </div>
  );
};

export default TetrisGame;

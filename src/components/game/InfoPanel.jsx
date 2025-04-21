import React from "react";
import NextPiecePreview from "./NextPiecePreview";

const InfoPanel = ({
  score,
  level,
  linesCleared,
  nextPiece,
  playerName,
  onPlayerNameChange,
}) => {
  const handleNameChange = (e) => {
    onPlayerNameChange(e.target.value);
  };

  return (
    <div className="info-panel">
      <div className="info-item">
        <label htmlFor="playerName">Player:</label>
        <input
          type="text"
          id="playerName"
          value={playerName}
          onChange={handleNameChange}
          maxLength={15}
          disabled={false}
        />
      </div>
      <div className="info-item">
        Score:<span>{score}</span>
      </div>
      <div className="info-item">
        Level:<span>{level}</span>
      </div>
      <div className="info-item">
        Lines:<span>{linesCleared}</span>
      </div>
      <div className="info-item info-item-next-piece-canvas">
        Next:
        <NextPiecePreview nextPiece={nextPiece} />
      </div>
    </div>
  );
};

export default InfoPanel;

import React from 'react';
import NextPiecePreview from './NextPiecePreview';

const InfoPanel = ({ score, level, linesCleared, nextPiece }) => {
  return (
    <div className="info-panel">
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

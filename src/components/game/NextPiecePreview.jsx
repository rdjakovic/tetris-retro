import React, { useEffect, useRef } from 'react';
import { BLOCK_SIZE, NEXT_PIECE_AREA_SIZE, COLORS } from '../../constants/tetrisConstants';

const NextPiecePreview = ({ nextPiece }) => {
  const canvasRef = useRef(null);
  
  // Draw the next piece
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    
    if (!context || !nextPiece) return;
    
    // Scale for the preview (slightly smaller blocks)
    const previewBlockSize = Math.floor(BLOCK_SIZE * 0.8);
    
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Center the piece in the preview area
    const offsetX = (NEXT_PIECE_AREA_SIZE - nextPiece.shape[0].length) / 2;
    const offsetY = (NEXT_PIECE_AREA_SIZE - nextPiece.shape.length) / 2;
    
    // Draw the next piece
    nextPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = COLORS[nextPiece.colorIndex];
          context.fillRect(
            (offsetX + x) * previewBlockSize, 
            (offsetY + y) * previewBlockSize, 
            previewBlockSize, 
            previewBlockSize
          );
          
          // Draw border
          context.strokeStyle = '#000';
          context.lineWidth = 1;
          context.strokeRect(
            (offsetX + x) * previewBlockSize, 
            (offsetY + y) * previewBlockSize, 
            previewBlockSize, 
            previewBlockSize
          );
        }
      });
    });
  }, [nextPiece]);
  
  // Calculate canvas dimensions
  const previewBlockSize = Math.floor(BLOCK_SIZE * 0.8);
  const canvasWidth = NEXT_PIECE_AREA_SIZE * previewBlockSize;
  const canvasHeight = NEXT_PIECE_AREA_SIZE * previewBlockSize;
  
  return (
    <canvas 
      ref={canvasRef} 
      id="next-piece-canvas" 
      width={canvasWidth} 
      height={canvasHeight}
    />
  );
};

export default NextPiecePreview;

import React, { useEffect, useRef } from 'react';
import { BLOCK_SIZE, COLORS } from '../../constants/tetrisConstants';

const GameBoard = ({ board, currentPiece }) => {
  const canvasRef = useRef(null);
  
  // Draw the board and current piece
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    
    if (!context) return;
    
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the board (locked pieces)
    board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = COLORS[value];
          context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          
          // Draw border
          context.strokeStyle = '#000';
          context.lineWidth = 1;
          context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
    
    // Draw the current piece
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const boardX = currentPiece.x + x;
            const boardY = currentPiece.y + y;
            
            context.fillStyle = COLORS[currentPiece.colorIndex];
            context.fillRect(
              boardX * BLOCK_SIZE, 
              boardY * BLOCK_SIZE, 
              BLOCK_SIZE, 
              BLOCK_SIZE
            );
            
            // Draw border
            context.strokeStyle = '#000';
            context.lineWidth = 1;
            context.strokeRect(
              boardX * BLOCK_SIZE, 
              boardY * BLOCK_SIZE, 
              BLOCK_SIZE, 
              BLOCK_SIZE
            );
          }
        });
      });
    }
  }, [board, currentPiece]);
  
  return (
    <canvas 
      ref={canvasRef} 
      id="tetris-board" 
      width={board[0].length * BLOCK_SIZE} 
      height={board.length * BLOCK_SIZE}
    />
  );
};

export default GameBoard;

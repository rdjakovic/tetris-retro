import { COLS, ROWS, SHAPES } from '../constants/tetrisConstants';

// Create an empty game board
export const createEmptyBoard = () => 
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Create a random tetromino piece
export const createRandomPiece = () => {
  if (!SHAPES || SHAPES.length === 0) {
    console.error("SHAPES array is not defined or empty!");
    // Return a default fallback piece to prevent crashing
    return { x: 0, y: 0, shape: [[1]], colorIndex: 1 };
  }
  
  const randomIndex = Math.floor(Math.random() * SHAPES.length);
  const shape = SHAPES[randomIndex];

  // Add a check for shape and shape[0] validity
  if (!shape || !shape[0]) {
    console.error(
      "Invalid shape selected from SHAPES array at index:",
      randomIndex,
      shape
    );
    // Return a default fallback piece
    return { x: 0, y: 0, shape: [[1]], colorIndex: 1 };
  }

  // Find the color index from the shape (non-zero value)
  let colorIndex = 0;
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] !== 0) {
        colorIndex = shape[row][col];
        break;
      }
    }
    if (colorIndex !== 0) break;
  }

  // Return the piece with initial position
  return {
    x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
    y: 0,
    shape,
    colorIndex,
  };
};

// Rotate a tetromino piece (clockwise)
export const rotatePieceMatrix = (piece) => {
  // Create a new matrix that is the transpose of the original
  const newMatrix = piece.shape[0].map((_, colIndex) =>
    piece.shape.map((row) => row[colIndex])
  );
  
  // Reverse each row to get a clockwise rotation
  return newMatrix.map((row) => [...row].reverse());
};

// Check if a piece collides with the board or boundaries
export const checkCollision = (x, y, shape, board) => {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] !== 0) {
        const boardX = x + col;
        const boardY = y + row;
        
        // Check boundaries
        if (
          boardX < 0 || 
          boardX >= COLS || 
          boardY < 0 || 
          boardY >= ROWS ||
          // Check collision with existing pieces on the board
          (boardY >= 0 && board[boardY][boardX] !== 0)
        ) {
          return true; // Collision detected
        }
      }
    }
  }
  return false; // No collision
};

// Merge a piece into the board
export const mergePieceToBoard = (piece, board) => {
  const newBoard = board.map(row => [...row]);
  
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] !== 0) {
        const boardY = piece.y + row;
        const boardX = piece.x + col;
        
        // Only merge if within bounds
        if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
          newBoard[boardY][boardX] = piece.colorIndex;
        }
      }
    }
  }
  
  return newBoard;
};

// Clear completed lines from the board
export const clearLines = (board) => {
  let linesCleared = 0;
  let newBoard = [...board];
  
  // Filter out complete lines
  newBoard = newBoard.filter(row => {
    const isComplete = row.every(cell => cell !== 0);
    if (isComplete) {
      linesCleared++;
      return false;
    }
    return true;
  });
  
  // Add empty rows at the top
  if (linesCleared > 0) {
    const emptyRows = Array.from({ length: linesCleared }, () => Array(COLS).fill(0));
    newBoard = [...emptyRows, ...newBoard];
  }
  
  return { newBoard, linesCleared };
};

// Calculate score based on lines cleared and level
export const calculateScore = (linesCleared, level) => {
  const points = [0, 40, 100, 300, 1200][linesCleared] || 0;
  return points * level;
};

// Calculate level based on total lines cleared
export const calculateLevel = (totalLinesCleared) => {
  return Math.floor(totalLinesCleared / 10) + 1;
};

// Calculate drop interval based on level
export const calculateDropInterval = (level) => {
  return Math.max(1000 - (level - 1) * 50, 100);
};

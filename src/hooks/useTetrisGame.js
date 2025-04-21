import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  COLS, 
  ROWS 
} from '../constants/tetrisConstants';
import {
  createEmptyBoard,
  createRandomPiece,
  checkCollision,
  mergePieceToBoard,
  clearLines,
  calculateScore,
  calculateLevel,
  calculateDropInterval,
  rotatePieceMatrix
} from '../utils/tetrisUtils';

const useTetrisGame = () => {
  // Game state
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(() => createRandomPiece());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Refs for game loop
  const gameLoopId = useRef(null);
  const lastTimeRef = useRef(0);
  const dropCounter = useRef(0);
  const dropIntervalRef = useRef(1000);

  // Move the current piece horizontally
  const movePiece = useCallback((direction) => {
    if (!currentPiece || isPaused || gameOver) return;

    const newX = currentPiece.x + direction;
    if (!checkCollision(newX, currentPiece.y, currentPiece.shape, board)) {
      setCurrentPiece(prev => ({
        ...prev,
        x: newX
      }));
    }
  }, [currentPiece, board, isPaused, gameOver]);

  // Rotate the current piece
  const rotatePiece = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return;

    const rotatedShape = rotatePieceMatrix(currentPiece);
    
    // Try rotation, if it causes collision, try wall kicks
    let newX = currentPiece.x;
    
    // Check if rotation is possible at current position
    if (!checkCollision(newX, currentPiece.y, rotatedShape, board)) {
      setCurrentPiece(prev => ({
        ...prev,
        shape: rotatedShape
      }));
      return;
    }
    
    // Try wall kicks (move left/right to make rotation possible)
    const kicks = [-1, 1, -2, 2]; // Try these offsets
    for (const kick of kicks) {
      if (!checkCollision(newX + kick, currentPiece.y, rotatedShape, board)) {
        setCurrentPiece(prev => ({
          ...prev,
          x: prev.x + kick,
          shape: rotatedShape
        }));
        return;
      }
    }
    
    // If all wall kicks fail, don't rotate
  }, [currentPiece, board, isPaused, gameOver]);

  // Drop the current piece one row down
  const dropPiece = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return;

    const newY = currentPiece.y + 1;
    
    if (!checkCollision(currentPiece.x, newY, currentPiece.shape, board)) {
      // No collision, move down
      setCurrentPiece(prev => ({
        ...prev,
        y: newY
      }));
    } else {
      // Collision detected, lock the piece and spawn a new one
      // Merge current piece to board
      const newBoard = mergePieceToBoard(currentPiece, board);
      setBoard(newBoard);
      
      // Clear completed lines
      const { newBoard: boardAfterClear, linesCleared: newLinesCleared } = clearLines(newBoard);
      
      if (newLinesCleared > 0) {
        // Update board after clearing lines
        setBoard(boardAfterClear);
        
        // Update score
        setScore(prev => prev + calculateScore(newLinesCleared, level));
        
        // Update lines cleared
        setLinesCleared(prev => {
          const newTotal = prev + newLinesCleared;
          const newLevel = calculateLevel(newTotal);
          
          // Update level if needed
          if (newLevel > level) {
            setLevel(newLevel);
            dropIntervalRef.current = calculateDropInterval(newLevel);
          }
          
          return newTotal;
        });
      }
      
      // Spawn next piece
      setCurrentPiece(nextPiece);
      setNextPiece(createRandomPiece());
      
      // Check for game over
      if (checkCollision(nextPiece.x, nextPiece.y, nextPiece.shape, boardAfterClear)) {
        setGameOver(true);
        setGameStarted(false);
        if (gameLoopId.current) {
          cancelAnimationFrame(gameLoopId.current);
          gameLoopId.current = null;
        }
      }
    }
  }, [currentPiece, nextPiece, board, level, isPaused, gameOver]);

  // Hard drop - drop the piece all the way down
  const hardDrop = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return;
    
    let newY = currentPiece.y;
    
    // Find the lowest position without collision
    while (!checkCollision(currentPiece.x, newY + 1, currentPiece.shape, board)) {
      newY++;
    }
    
    // Update position and trigger piece lock
    setCurrentPiece(prev => ({
      ...prev,
      y: newY
    }));
    
    // Force immediate lock by calling dropPiece after state update
    setTimeout(dropPiece, 0);
  }, [currentPiece, board, dropPiece, isPaused, gameOver]);

  // Game loop
  const gameLoop = useCallback((time) => {
    if (isPaused || gameOver || !gameStarted) {
      return;
    }
    
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    
    dropCounter.current += deltaTime;
    
    if (dropCounter.current > dropIntervalRef.current) {
      dropPiece();
      dropCounter.current = 0;
    }
    
    gameLoopId.current = requestAnimationFrame(gameLoop);
  }, [isPaused, gameOver, gameStarted, dropPiece]);

  // Toggle pause state
  const handleTogglePause = useCallback(() => {
    if (!gameStarted || gameOver) return;
    setIsPaused(prev => !prev);
  }, [gameStarted, gameOver]);

  // Start a new game
  const handleStartGame = useCallback(() => {
    if (gameOver || gameStarted) return;
    
    setBoard(createEmptyBoard());
    const firstPiece = createRandomPiece();
    setCurrentPiece(firstPiece);
    setNextPiece(createRandomPiece());
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setGameOver(false);
    setIsPaused(false);
    dropIntervalRef.current = 1000;
    dropCounter.current = 0;
    lastTimeRef.current = 0;
    setGameStarted(true);
  }, [gameOver, gameStarted]);

  // Restart the game
  const handleRestartGame = useCallback(() => {
    setBoard(createEmptyBoard());
    const firstPiece = createRandomPiece();
    setCurrentPiece(firstPiece);
    setNextPiece(createRandomPiece());
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setGameOver(false);
    setIsPaused(false);
    dropIntervalRef.current = 1000;
    dropCounter.current = 0;
    lastTimeRef.current = 0;
    setGameStarted(true);
  }, []);

  // Effect for starting/stopping the game loop
  useEffect(() => {
    if (gameStarted && !isPaused && !gameOver) {
      lastTimeRef.current = performance.now();
      dropCounter.current = 0;
      gameLoopId.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopId.current) {
        cancelAnimationFrame(gameLoopId.current);
        gameLoopId.current = null;
      }
    }
    
    return () => {
      if (gameLoopId.current) {
        cancelAnimationFrame(gameLoopId.current);
        gameLoopId.current = null;
      }
    };
  }, [gameStarted, isPaused, gameOver, gameLoop]);

  // Effect for keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!gameStarted || isPaused || gameOver) return;
      
      let pieceMoved = false;
      
      switch (event.keyCode) {
        case 37: // Left Arrow
          movePiece(-1);
          pieceMoved = true;
          break;
        case 39: // Right Arrow
          movePiece(1);
          pieceMoved = true;
          break;
        case 40: // Down Arrow
          dropPiece();
          pieceMoved = true;
          break;
        case 38: // Up Arrow
          rotatePiece();
          pieceMoved = true;
          break;
        case 32: // Spacebar
          hardDrop();
          pieceMoved = true;
          break;
        case 80: // 'P' key
          handleTogglePause();
          pieceMoved = true;
          break;
        default:
          break;
      }
      
      if (pieceMoved) {
        event.preventDefault();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    gameStarted,
    isPaused,
    gameOver,
    movePiece,
    dropPiece,
    rotatePiece,
    hardDrop,
    handleTogglePause
  ]);

  return {
    // Game state
    board,
    currentPiece,
    nextPiece,
    score,
    level,
    linesCleared,
    gameOver,
    isPaused,
    gameStarted,
    
    // Game actions
    movePiece,
    dropPiece,
    rotatePiece,
    hardDrop,
    handleTogglePause,
    handleStartGame,
    handleRestartGame
  };
};

export default useTetrisGame;

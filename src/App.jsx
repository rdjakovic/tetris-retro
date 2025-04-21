import React, { useState, useEffect, useRef, useCallback } from "react";
import "./TetrisGame.css"; // Adjust path if necessary

// --- Constants and Helper Functions (Define BEFORE the component) ---
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const NEXT_PIECE_AREA_SIZE = 4;

// Ensure SHAPES is defined correctly here
const SHAPES = [
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ], // I
  [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0],
  ], // J
  [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0],
  ], // L
  [
    [4, 4],
    [4, 4],
  ], // O
  [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0],
  ], // S
  [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0],
  ], // T
  [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0],
  ], // Z
];

// Ensure COLORS is defined correctly here
const COLORS = [
  null, // 0: Empty
  "#00f0f0", // 1: I (Cyan)
  "#0000f0", // 2: J (Blue)
  "#f0a000", // 3: L (Orange)
  "#f0f000", // 4: O (Yellow)
  "#00f000", // 5: S (Green)
  "#a000f0", // 6: T (Purple)
  "#f00000", // 7: Z (Red)
];

const createEmptyBoard = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Define createRandomPiece *after* SHAPES and COLS are defined
const createRandomPiece = () => {
  // console.log("Creating random piece. SHAPES available:", !!SHAPES); // Optional log
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

  const shapeWidth = shape[0].length; // This line caused the error
  const colorIndex = randomIndex + 1;

  return {
    x: Math.floor(COLS / 2) - Math.floor(shapeWidth / 2),
    y: 0,
    shape: shape,
    colorIndex: colorIndex,
  };
};

// --- React Component Definition ---
function TetrisGame() {
  // --- State ---
  // Initialize state *after* helper functions are defined
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  // Use createRandomPiece safely here because it's defined above
  const [nextPiece, setNextPiece] = useState(() => createRandomPiece());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // --- Refs --- (Keep as is)
  const canvasRef = useRef(null);
  const nextCanvasRef = useRef(null);
  const gameLoopId = useRef(null);
  const dropCounter = useRef(0);
  const lastTimeRef = useRef(0);
  const dropIntervalRef = useRef(1000);

  // --- Drawing Functions ---
  // Define drawBlock, drawBoard, drawPiece, drawNextPiece using useCallback
  // Ensure they are defined *before* being used in useEffect dependencies
  // (Code for these functions remains the same as previous version)
  // ... (drawBlock, drawBoard, drawPiece, drawNextPiece functions) ...
  const drawBlock = useCallback((x, y, colorIndex, ctx) => {
    if (colorIndex < 0 || colorIndex >= COLORS.length || !ctx) return;
    ctx.fillStyle = COLORS[colorIndex];
    ctx.fillRect(x, y, 1, 1);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 0.05;
    ctx.strokeRect(x, y, 1, 1);
  }, []); // No dependencies needed if COLORS is stable

  const drawBoard = useCallback(
    (ctx) => {
      if (!ctx) return;
      ctx.fillStyle = "#0f193a";
      const canvasWidth = ctx.canvas.width / BLOCK_SIZE;
      const canvasHeight = ctx.canvas.height / BLOCK_SIZE;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      board.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            drawBlock(x, y, value, ctx);
          }
        });
      });
    },
    [board, drawBlock]
  ); // Depends on board state and drawBlock

  const drawPiece = useCallback(
    (piece, ctx) => {
      if (!piece || !ctx) return;
      piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            drawBlock(piece.x + x, piece.y + y, piece.colorIndex, ctx);
          }
        });
      });
    },
    [drawBlock]
  ); // Depends on drawBlock

  const drawNextPiece = useCallback(() => {
    const ctx = nextCanvasRef.current?.getContext("2d");
    if (!ctx || !nextPiece) return;

    const nextCanvasWidth = ctx.canvas.width;
    const nextCanvasHeight = ctx.canvas.height;
    const nextBlockSize = nextCanvasWidth / NEXT_PIECE_AREA_SIZE;

    ctx.save();
    ctx.scale(nextBlockSize, nextBlockSize);
    ctx.fillStyle = "#0f193a";
    ctx.fillRect(0, 0, NEXT_PIECE_AREA_SIZE, NEXT_PIECE_AREA_SIZE);

    const shape = nextPiece.shape;
    let minY = shape.length,
      maxY = -1,
      minX = shape[0].length,
      maxX = -1;
    shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      });
    });
    const shapeHeight = maxY === -1 ? 0 : maxY - minY + 1;
    const shapeWidth = maxX === -1 ? 0 : maxX - minX + 1;
    const offsetX = (NEXT_PIECE_AREA_SIZE - shapeWidth) / 2;
    const offsetY = (NEXT_PIECE_AREA_SIZE - shapeHeight) / 2;

    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          drawBlock(
            offsetX + (x - minX),
            offsetY + (y - minY),
            nextPiece.colorIndex,
            ctx
          );
        }
      });
    });
    ctx.restore();
  }, [nextPiece, drawBlock]); // Depends on nextPiece state and drawBlock

  // --- Collision Detection ---
  // (checkCollision function - same as before)
  // ... checkCollision function ...
  const checkCollision = useCallback(
    (x, y, shape) => {
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col] > 0) {
            const boardX = x + col;
            const boardY = y + row;
            if (
              boardX < 0 ||
              boardX >= COLS ||
              boardY >= ROWS ||
              (boardY >= 0 && board[boardY] && board[boardY][boardX] > 0)
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [board]
  );

  // --- Game Logic Functions ---
  // (rotateMatrix, lockPiece, clearLines, spawnNewPiece, dropPiece, movePiece, rotatePiece, hardDrop - same as before, ensure defined before use)
  // ... (All game logic functions using useCallback where appropriate) ...
  const rotateMatrix = (matrix) => {
    // Doesn't depend on state/props, can be outside or inside
    const rows = matrix.length;
    const cols = matrix[0].length;
    const newMatrix = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (matrix[y][x]) {
          newMatrix[x][rows - 1 - y] = matrix[y][x];
        }
      }
    }
    return newMatrix;
  };

  const lockPiece = useCallback(() => {
    if (!currentPiece) return;
    const newBoard = board.map((row) => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          const boardX = currentPiece.x + x;
          const boardY = currentPiece.y + y;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            newBoard[boardY][boardX] = currentPiece.colorIndex;
          }
        }
      });
    });
    setBoard(newBoard);
  }, [currentPiece, board]);

  const clearLines = useCallback(() => {
    let linesToClear = 0;
    const newBoard = board.filter((row) => !row.every((cell) => cell > 0));
    linesToClear = ROWS - newBoard.length;

    if (linesToClear > 0) {
      const emptyRows = Array.from({ length: linesToClear }, () =>
        Array(COLS).fill(0)
      );
      const finalBoard = [...emptyRows, ...newBoard];
      setBoard(finalBoard);

      setScore((prev) => {
        const points = [0, 40, 100, 300, 1200][linesToClear] || 0;
        const levelMultiplier = level || 1;
        return prev + points * levelMultiplier;
      });
      setLinesCleared((prev) => {
        const newTotalLines = prev + linesToClear;
        const newLevel = Math.floor(newTotalLines / 10) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
          dropIntervalRef.current = Math.max(1000 - (newLevel - 1) * 50, 100);
        }
        return newTotalLines;
      });
    }
  }, [board, level]);

  // Define spawnNewPiece using useCallback
  const spawnNewPiece = useCallback(() => {
    const piece = nextPiece;
    setCurrentPiece(piece);
    setNextPiece(createRandomPiece());

    if (checkCollision(piece.x, piece.y, piece.shape)) {
      setGameOver(true);
      setGameStarted(false);
      if (gameLoopId.current) {
        cancelAnimationFrame(gameLoopId.current);
        gameLoopId.current = null;
      }
    }
  }, [nextPiece, checkCollision]); // Add checkCollision to dependencies

  // Define dropPiece using useCallback
  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused || !gameStarted) return;

    if (
      !checkCollision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)
    ) {
      setCurrentPiece((prev) => ({ ...prev, y: prev.y + 1 }));
    } else {
      lockPiece();
      clearLines();
      spawnNewPiece();
    }
    dropCounter.current = 0;
  }, [
    currentPiece,
    gameOver,
    isPaused,
    gameStarted,
    checkCollision,
    lockPiece,
    clearLines,
    spawnNewPiece,
  ]); // Add dependencies

  // Define movePiece using useCallback
  const movePiece = useCallback(
    (direction) => {
      if (!currentPiece || gameOver || isPaused || !gameStarted) return;
      const newX = currentPiece.x + direction;
      if (!checkCollision(newX, currentPiece.y, currentPiece.shape)) {
        setCurrentPiece((prev) => ({ ...prev, x: newX }));
      }
    },
    [currentPiece, gameOver, isPaused, gameStarted, checkCollision]
  ); // Add dependencies

  // Define rotatePiece using useCallback
  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused || !gameStarted) return;
    const originalShape = currentPiece.shape;
    const rotatedShape = rotateMatrix(originalShape); // Use helper
    let newX = currentPiece.x;

    // Basic wall kick logic (can be improved)
    let offsetX = 0;
    if (checkCollision(newX, currentPiece.y, rotatedShape)) {
      offsetX = 1; // Try moving right
      if (checkCollision(newX + offsetX, currentPiece.y, rotatedShape)) {
        offsetX = -1; // Try moving left
        if (checkCollision(newX + offsetX, currentPiece.y, rotatedShape)) {
          offsetX = 2; // Try moving right more
          if (checkCollision(newX + offsetX, currentPiece.y, rotatedShape)) {
            offsetX = -2; // Try moving left more
            if (checkCollision(newX + offsetX, currentPiece.y, rotatedShape)) {
              return; // Cannot rotate even with kicks
            }
          }
        }
      }
    }

    // Apply rotation with successful offset
    setCurrentPiece((prev) => ({
      ...prev,
      x: newX + offsetX,
      shape: rotatedShape,
    }));
  }, [currentPiece, gameOver, isPaused, gameStarted, checkCollision]); // Add dependencies

  // Define hardDrop using useCallback
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused || !gameStarted) return;
    let newY = currentPiece.y;
    while (!checkCollision(currentPiece.x, newY + 1, currentPiece.shape)) {
      newY++;
    }
    // Lock, clear, spawn directly using the final position
    const pieceToLock = { ...currentPiece, y: newY };

    // --- Inline Lock/Clear/Spawn logic for Hard Drop ---
    // 1. Lock the piece at its final position
    const newBoard = board.map((row) => [...row]);
    pieceToLock.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          const boardX = pieceToLock.x + x;
          const boardY = pieceToLock.y + y;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            newBoard[boardY][boardX] = pieceToLock.colorIndex;
          }
        }
      });
    });
    // setBoard(newBoard); // Update board state after locking

    // 2. Clear lines based on the new board state
    let linesToClear = 0;
    const boardAfterLock = newBoard; // Use the board we just created
    const boardWithoutCleared = boardAfterLock.filter(
      (row) => !row.every((cell) => cell > 0)
    );
    linesToClear = ROWS - boardWithoutCleared.length;

    let finalBoard = boardAfterLock; // Start with the locked board
    if (linesToClear > 0) {
      const emptyRows = Array.from({ length: linesToClear }, () =>
        Array(COLS).fill(0)
      );
      finalBoard = [...emptyRows, ...boardWithoutCleared]; // Create board after clearing

      // Update Score, Lines, Level immediately
      setScore((prevScore) => {
        const points = [0, 40, 100, 300, 1200][linesToClear] || 0;
        const levelMultiplier = level || 1;
        return prevScore + points * levelMultiplier;
      });
      setLinesCleared((prevLines) => {
        const newTotalLines = prevLines + linesToClear;
        const newLevel = Math.floor(newTotalLines / 10) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
          dropIntervalRef.current = Math.max(1000 - (newLevel - 1) * 50, 100);
        }
        return newTotalLines;
      });
    }
    setBoard(finalBoard); // Update board state with potential clears

    // 3. Spawn the next piece
    const next = nextPiece;
    setNextPiece(createRandomPiece()); // Generate the *next* next piece

    // Check for game over with the newly spawned piece
    if (checkCollision(next.x, next.y, next.shape)) {
      setGameOver(true);
      setGameStarted(false);
      if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
      setCurrentPiece(null); // Clear current piece on game over
    } else {
      setCurrentPiece(next); // Set the spawned piece as current
    }
    // --- End Inline Logic ---

    dropCounter.current = 0; // Reset drop counter
  }, [
    currentPiece,
    nextPiece,
    board,
    gameOver,
    isPaused,
    gameStarted,
    checkCollision,
    level,
  ]); // Add dependencies

  // --- Game Loop ---
  // (gameLoop function - same as before)
  // ... gameLoop function ...
  const gameLoop = useCallback(
    (timestamp) => {
      if (isPaused || gameOver || !gameStarted) {
        gameLoopId.current = null;
        return;
      }
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      dropCounter.current += deltaTime;

      if (dropCounter.current > dropIntervalRef.current) {
        dropPiece();
      }
      gameLoopId.current = requestAnimationFrame(gameLoop);
    },
    [isPaused, gameOver, gameStarted, dropPiece]
  );

  // --- Effects --- (Ensure correct dependencies)
  // (useEffect for game loop, drawing, keyboard, canvas setup - same as before)
  // ... useEffect hooks ...
  useEffect(() => {
    // Game Loop Control
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

  useEffect(() => {
    // Drawing Effect
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (context) {
      context.setTransform(1, 0, 0, 1, 0, 0); // Reset
      context.scale(BLOCK_SIZE, BLOCK_SIZE); // Scale
      drawBoard(context);
      if (currentPiece) {
        drawPiece(currentPiece, context);
      }
    }
  }, [board, currentPiece, drawBoard, drawPiece]);

  useEffect(() => {
    // Draw Next Piece Effect
    drawNextPiece();
  }, [nextPiece, drawNextPiece]);

  // Define handleTogglePause using useCallback *before* using it in useEffect
  const handleTogglePause = useCallback(() => {
    if (!gameStarted || gameOver) return;
    setIsPaused((prev) => !prev);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    // Keyboard Controls Effect
    const handleKeyDown = (event) => {
      if (!gameStarted || isPaused || gameOver) return;
      let pieceMoved = false;
      switch (event.keyCode) {
        case 37:
          movePiece(-1);
          pieceMoved = true;
          break;
        case 39:
          movePiece(1);
          pieceMoved = true;
          break;
        case 40:
          dropPiece();
          pieceMoved = true;
          break;
        case 38:
          rotatePiece();
          pieceMoved = true;
          break;
        case 32:
          hardDrop();
          pieceMoved = true;
          break;
        case 80:
          handleTogglePause();
          pieceMoved = true;
          break;
        default:
          break;
      }
      if (pieceMoved) event.preventDefault();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // Add ALL functions called inside to dependency array
  }, [
    gameStarted,
    isPaused,
    gameOver,
    movePiece,
    dropPiece,
    rotatePiece,
    hardDrop,
    handleTogglePause,
  ]);

  useEffect(() => {
    // Canvas Setup Effect
    const canvas = canvasRef.current;
    const nextCanvas = nextCanvasRef.current;
    if (canvas) {
      canvas.width = COLS * BLOCK_SIZE;
      canvas.height = ROWS * BLOCK_SIZE;
    }
    if (nextCanvas) {
      const nextPreviewSize = Math.floor(BLOCK_SIZE * 0.8);
      nextCanvas.width = NEXT_PIECE_AREA_SIZE * nextPreviewSize;
      nextCanvas.height = NEXT_PIECE_AREA_SIZE * nextPreviewSize;
    }
  }, []); // Run only once on mount

  // --- Control Handlers ---
  // (handleStartGame, handleRestartGame - same as before)
  // ... handleStartGame, handleRestartGame functions ...
  const handleStartGame = () => {
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
  };

  const handleRestartGame = () => {
    if (gameLoopId.current) {
      cancelAnimationFrame(gameLoopId.current);
      gameLoopId.current = null;
    }
    setBoard(createEmptyBoard());
    setCurrentPiece(null);
    setNextPiece(createRandomPiece());
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(false);
    dropIntervalRef.current = 1000;
    dropCounter.current = 0;
    lastTimeRef.current = 0;
  };

  // --- JSX Rendering ---
  // (Return statement - same as before)
  // ... return (...) ...
  return (
    <div className="tetris-container">
      <h1>Tetris</h1>
      <div className="game-area">
        <canvas ref={canvasRef} id="tetris-board"></canvas>
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
            <canvas ref={nextCanvasRef} id="next-piece-canvas"></canvas>
          </div>
          <div className="game-controls">
            {!gameStarted && !gameOver && (
              <button className="start-button" onClick={handleStartGame}>
                Start Game
              </button>
            )}
            {gameStarted && !gameOver && (
              <button
                className="pause-resume-button"
                onClick={handleTogglePause} // Use the memoized handler
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            )}
            {/* Show Restart button only when game is over */}
            {gameOver && (
              <button className="restart-button" onClick={handleRestartGame}>
                Restart Game
              </button>
            )}
          </div>
        </div>
        {isPaused && !gameOver && <div className="paused-overlay">Paused</div>}
        {gameOver && (
          <div className="game-over-message">
            Game Over!
            <div id="final-score">Score: {score}</div>
            <button onClick={handleRestartGame}>Restart</button>
          </div>
        )}
      </div>
      <div className="controls-info">
        <p>Controls:</p>
        <p>Left/Right Arrows: Move</p>
        <p>Up Arrow: Rotate</p>
        <p>Down Arrow: Soft Drop</p>
        <p>Spacebar: Hard Drop</p>
        <p>P: Pause/Resume</p>
      </div>
    </div>
  );
}

// Export the component
export default TetrisGame; // Assuming this is the default export if it's the main component in the file

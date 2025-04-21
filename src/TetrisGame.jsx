import React, { useState, useEffect, useRef, useCallback } from "react";
import "./TetrisGame.css"; // Import the CSS

// --- Game Constants ---
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // In pixels (used for canvas scaling)
const NEXT_PIECE_AREA_SIZE = 4; // 4x4 blocks

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

const createRandomPiece = () => {
  const randomIndex = Math.floor(Math.random() * SHAPES.length);
  const shape = SHAPES[randomIndex];
  const colorIndex = randomIndex + 1;
  return {
    x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
    y: 0,
    shape: shape,
    colorIndex: colorIndex,
  };
};

function TetrisGame() {
  // --- State ---
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(() => createRandomPiece());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // --- Refs ---
  const canvasRef = useRef(null);
  const nextCanvasRef = useRef(null);
  const gameLoopId = useRef(null); // Stores requestAnimationFrame ID
  const dropCounter = useRef(0);
  const lastTimeRef = useRef(0);
  const dropIntervalRef = useRef(1000); // Initial drop interval

  // --- Drawing Functions ---
  const drawBlock = useCallback((x, y, colorIndex, ctx) => {
    if (colorIndex < 0 || colorIndex >= COLORS.length || !ctx) return;
    ctx.fillStyle = COLORS[colorIndex];
    ctx.fillRect(x, y, 1, 1);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"; // Border for blocks
    ctx.lineWidth = 0.05; // Relative to block size after scaling
    ctx.strokeRect(x, y, 1, 1);
  }, []);

  const drawBoard = useCallback(
    (ctx) => {
      if (!ctx) return;
      // Clear board first
      ctx.fillStyle = "#0f193a"; // Dark background for play area
      ctx.fillRect(
        0,
        0,
        ctx.canvas.width / BLOCK_SIZE,
        ctx.canvas.height / BLOCK_SIZE
      );

      // Draw locked pieces
      board.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            drawBlock(x, y, value, ctx);
          }
        });
      });
    },
    [board, drawBlock]
  );

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
  );

  const drawNextPiece = useCallback(() => {
    const ctx = nextCanvasRef.current?.getContext("2d");
    if (!ctx || !nextPiece) return;

    const nextBlockSize = ctx.canvas.width / NEXT_PIECE_AREA_SIZE;
    ctx.save(); // Save context state before scaling
    ctx.scale(nextBlockSize, nextBlockSize);

    // Clear next piece area
    ctx.fillStyle = "#0f193a";
    ctx.fillRect(0, 0, NEXT_PIECE_AREA_SIZE, NEXT_PIECE_AREA_SIZE);

    const shape = nextPiece.shape;
    // Calculate offsets to center the piece
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

    // Draw the piece centered
    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          // Adjust coordinates based on the piece's actual content bounds (minX, minY)
          drawBlock(
            offsetX + (x - minX),
            offsetY + (y - minY),
            nextPiece.colorIndex,
            ctx
          );
        }
      });
    });
    ctx.restore(); // Restore context state after drawing
  }, [nextPiece, drawBlock]);

  // --- Collision Detection ---
  const checkCollision = useCallback(
    (x, y, shape) => {
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col] > 0) {
            const boardX = x + col;
            const boardY = y + row;

            // Check boundaries and collision with existing blocks
            if (
              boardX < 0 ||
              boardX >= COLS ||
              boardY >= ROWS ||
              (boardY >= 0 && board[boardY] && board[boardY][boardX] > 0) // Check if cell exists and is filled
            ) {
              return true; // Collision detected
            }
          }
        }
      }
      return false; // No collision
    },
    [board]
  ); // Depends on the current board state

  // --- Game Logic Functions ---
  const rotateMatrix = (matrix) => {
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
    const newBoard = board.map((row) => [...row]); // Create a new board copy
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
    setBoard(newBoard); // Update the board state
  }, [currentPiece, board]); // board dependency is important here

  const clearLines = useCallback(() => {
    let linesToClear = 0;
    const newBoard = board.filter((row) => !row.every((cell) => cell > 0)); // Keep rows that are not full
    linesToClear = ROWS - newBoard.length;

    if (linesToClear > 0) {
      // Add empty rows at the top
      const emptyRows = Array.from({ length: linesToClear }, () =>
        Array(COLS).fill(0)
      );
      const finalBoard = [...emptyRows, ...newBoard];
      setBoard(finalBoard); // Update board state

      // Update Score, Lines, Level
      setScore((prev) => {
        const points = [0, 40, 100, 300, 1200][linesToClear] || 0;
        return prev + points * level;
      });
      setLinesCleared((prev) => {
        const newTotalLines = prev + linesToClear;
        const newLevel = Math.floor(newTotalLines / 10) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
          // Adjust drop interval based on new level
          dropIntervalRef.current = Math.max(1000 - (newLevel - 1) * 50, 100);
        }
        return newTotalLines;
      });
    }
  }, [board, level]); // Depends on board and level

  const spawnNewPiece = useCallback(() => {
    const piece = nextPiece; // Use the existing next piece
    setCurrentPiece(piece);
    setNextPiece(createRandomPiece()); // Generate the *next* next piece

    // Check for game over immediately after spawning
    if (checkCollision(piece.x, piece.y, piece.shape)) {
      setGameOver(true);
      setGameStarted(false); // Stop game
      if (gameLoopId.current) {
        cancelAnimationFrame(gameLoopId.current);
        gameLoopId.current = null;
      }
    }
  }, [nextPiece, checkCollision]);

  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused || !gameStarted) return;

    if (
      !checkCollision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)
    ) {
      setCurrentPiece((prev) => ({ ...prev, y: prev.y + 1 }));
    } else {
      // Lock piece, clear lines, spawn next
      lockPiece();
      clearLines();
      spawnNewPiece(); // This now handles game over check
    }
    dropCounter.current = 0; // Reset counter after drop/lock
  }, [
    currentPiece,
    gameOver,
    isPaused,
    gameStarted,
    checkCollision,
    lockPiece,
    clearLines,
    spawnNewPiece,
  ]);

  const movePiece = useCallback(
    (direction) => {
      if (!currentPiece || gameOver || isPaused || !gameStarted) return;
      const newX = currentPiece.x + direction;
      if (!checkCollision(newX, currentPiece.y, currentPiece.shape)) {
        setCurrentPiece((prev) => ({ ...prev, x: newX }));
      }
    },
    [currentPiece, gameOver, isPaused, gameStarted, checkCollision]
  );

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused || !gameStarted) return;
    const originalShape = currentPiece.shape;
    const rotatedShape = rotateMatrix(originalShape);
    let newX = currentPiece.x;
    let offsetX = 1;

    // 1. Try rotation without offset
    if (!checkCollision(newX, currentPiece.y, rotatedShape)) {
      setCurrentPiece((prev) => ({ ...prev, shape: rotatedShape }));
      return;
    }

    // 2. Try wall kicks (basic)
    while (checkCollision(newX, currentPiece.y, rotatedShape)) {
      newX += offsetX;
      // Check if offset goes too far
      if (Math.abs(offsetX) > rotatedShape[0].length) {
        return; // Cannot rotate
      }
      offsetX = -(offsetX + (offsetX > 0 ? 1 : -1)); // Alternate direction: 1, -1, 2, -2...
    }
    // Apply rotation with successful offset
    setCurrentPiece((prev) => ({ ...prev, x: newX, shape: rotatedShape }));
  }, [currentPiece, gameOver, isPaused, gameStarted, checkCollision]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused || !gameStarted) return;
    let newY = currentPiece.y;
    while (!checkCollision(currentPiece.x, newY + 1, currentPiece.shape)) {
      newY++;
    }
    // Use functional update to ensure we use the latest piece state
    setCurrentPiece((prev) => {
      if (!prev) return null; // Should not happen, but safety check
      const pieceToLock = { ...prev, y: newY };

      // Perform lock, clear, spawn within the same update cycle if possible
      const newBoard = board.map((row) => [...row]); // Create a new board copy
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
      setBoard(newBoard); // Update board immediately

      // Now clear lines based on the new board (this part might need refinement)
      // Note: clearLines reads 'board' state, which might not be updated yet here.
      // This is a common React challenge with dependent state updates.
      // A potential solution is to calculate cleared lines based on `newBoard` directly.

      let linesToClear = 0;
      const boardAfterLock = newBoard; // Use the board we just created
      const boardWithoutCleared = boardAfterLock.filter(
        (row) => !row.every((cell) => cell > 0)
      );
      linesToClear = ROWS - boardWithoutCleared.length;

      if (linesToClear > 0) {
        const emptyRows = Array.from({ length: linesToClear }, () =>
          Array(COLS).fill(0)
        );
        const finalBoard = [...emptyRows, ...boardWithoutCleared];
        setBoard(finalBoard); // Update board again with cleared lines

        setScore((prevScore) => {
          const points = [0, 40, 100, 300, 1200][linesToClear] || 0;
          return prevScore + points * level;
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

      // Spawn next piece (needs the 'nextPiece' state)
      const next = nextPiece;
      setNextPiece(createRandomPiece());

      // Check for game over with the newly spawned piece
      if (checkCollision(next.x, next.y, next.shape)) {
        setGameOver(true);
        setGameStarted(false);
        if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
        return null; // Return null to signify game over stops piece update
      }

      return next; // Return the new piece to be set as current
    });

    dropCounter.current = 0;
  }, [
    currentPiece,
    nextPiece,
    board,
    gameOver,
    isPaused,
    gameStarted,
    checkCollision,
    level,
  ]); // Added dependencies

  // --- Game Loop ---
  const gameLoop = useCallback(
    (timestamp) => {
      if (isPaused || gameOver || !gameStarted) {
        gameLoopId.current = null; // Ensure loop stops if paused/over/not started
        return;
      }

      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp; // Initialize lastTime on first frame
      }
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      dropCounter.current += deltaTime;

      if (dropCounter.current > dropIntervalRef.current) {
        dropPiece(); // Autodrop
      }

      // Draw game state (drawing is handled by separate useEffects based on state changes)
      // No drawing calls needed directly inside the loop if effects are set up correctly.

      gameLoopId.current = requestAnimationFrame(gameLoop);
    },
    [isPaused, gameOver, gameStarted, dropPiece]
  ); // Dependencies for the loop logic

  // --- Effect for starting/stopping the game loop ---
  useEffect(() => {
    if (gameStarted && !isPaused && !gameOver) {
      lastTimeRef.current = performance.now(); // Reset timer on resume/start
      dropCounter.current = 0;
      gameLoopId.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopId.current) {
        cancelAnimationFrame(gameLoopId.current);
        gameLoopId.current = null;
      }
    }
    // Cleanup function to cancel animation frame when component unmounts or dependencies change
    return () => {
      if (gameLoopId.current) {
        cancelAnimationFrame(gameLoopId.current);
        gameLoopId.current = null;
      }
    };
  }, [gameStarted, isPaused, gameOver, gameLoop]); // Restart loop if these states change

  // --- Effect for Drawing Main Board and Current Piece ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (context) {
      context.scale(BLOCK_SIZE, BLOCK_SIZE); // Scale once
      drawBoard(context); // Draw locked pieces
      if (currentPiece) {
        // Draw falling piece
        drawPiece(currentPiece, context);
      }
      // Reset transform to prevent accumulation on re-renders (important!)
      context.setTransform(1, 0, 0, 1, 0, 0);
    }
  }, [board, currentPiece, drawBoard, drawPiece]); // Redraw when board or piece changes

  // --- Effect for Drawing Next Piece ---
  useEffect(() => {
    drawNextPiece();
  }, [nextPiece, drawNextPiece]); // Redraw when nextPiece changes

  // --- Effect for Keyboard Controls ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!gameStarted || isPaused || gameOver) return; // Ignore input if game not active

      switch (event.keyCode) {
        case 37: // Left Arrow
          movePiece(-1);
          event.preventDefault();
          break;
        case 39: // Right Arrow
          movePiece(1);
          event.preventDefault();
          break;
        case 40: // Down Arrow (Soft Drop)
          dropPiece();
          event.preventDefault();
          break;
        case 38: // Up Arrow (Rotate)
          rotatePiece();
          event.preventDefault();
          break;
        case 32: // Spacebar (Hard Drop)
          hardDrop();
          event.preventDefault();
          break;
        case 80: // 'P' key for Pause/Resume
          handleTogglePause(); // Use the handler function
          event.preventDefault();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    gameStarted,
    isPaused,
    gameOver,
    movePiece,
    dropPiece,
    rotatePiece,
    hardDrop,
  ]); // Re-bind if game state changes affecting handler logic

  // --- Control Handlers ---
  const handleStartGame = () => {
    if (gameOver) return; // Don't start if game is over (use restart)
    setBoard(createEmptyBoard());
    setCurrentPiece(createRandomPiece()); // Set initial piece
    setNextPiece(createRandomPiece());
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setGameOver(false);
    setIsPaused(false);
    dropIntervalRef.current = 1000; // Reset speed
    setGameStarted(true);
  };

  const handleTogglePause = () => {
    if (!gameStarted || gameOver) return;
    setIsPaused((prev) => !prev);
  };

  const handleRestartGame = () => {
    // Reset all state variables to initial values
    setBoard(createEmptyBoard());
    setCurrentPiece(null); // Will be set by start
    setNextPiece(createRandomPiece()); // Prepare next piece
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(false); // Require clicking start again
    dropIntervalRef.current = 1000;
    // Reset refs related to game loop timing if needed
    dropCounter.current = 0;
    lastTimeRef.current = 0;
    // Game loop will stop automatically due to gameStarted being false
    // Call handleStartGame() immediately if you want restart to auto-start
    // handleStartGame();
  };

  // Set initial canvas sizes (can be done once on mount)
  useEffect(() => {
    const canvas = canvasRef.current;
    const nextCanvas = nextCanvasRef.current;
    if (canvas) {
      canvas.width = COLS * BLOCK_SIZE;
      canvas.height = ROWS * BLOCK_SIZE;
    }
    if (nextCanvas) {
      // Calculate next canvas size based on block size and area size
      const nextPreviewSize = Math.floor(BLOCK_SIZE * 0.8); // Make next blocks slightly smaller
      nextCanvas.width = NEXT_PIECE_AREA_SIZE * nextPreviewSize;
      nextCanvas.height = NEXT_PIECE_AREA_SIZE * nextPreviewSize;
    }
    // Set initial piece if not already set (e.g., after reset)
    if (!currentPiece && !gameStarted && !gameOver) {
      setCurrentPiece(createRandomPiece());
    }
  }, [currentPiece, gameStarted, gameOver]); // Run once, maybe update if block size changes

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
            {gameStarted && (
              <button
                className="pause-resume-button"
                onClick={handleTogglePause}
                disabled={gameOver} // Disable if game over
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            )}
            {/* Optionally show Restart button always or only on Game Over */}
            {/* { (gameStarted || gameOver) && (
                            <button onClick={handleRestartGame}>Restart</button>
                         )} */}
          </div>
        </div>

        {/* Overlays */}
        {isPaused && <div className="paused-overlay">Paused</div>}

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

export default TetrisGame;

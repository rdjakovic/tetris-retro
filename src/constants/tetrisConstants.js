// Game Constants
export const COLS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 30; // In pixels (used for canvas scaling)
export const NEXT_PIECE_AREA_SIZE = 4; // 4x4 blocks

// Tetromino shapes with their color indices
export const SHAPES = [
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

// Colors for each tetromino type
export const COLORS = [
  null, // 0: Empty
  "#00f0f0", // 1: I (Cyan)
  "#0000f0", // 2: J (Blue)
  "#f0a000", // 3: L (Orange)
  "#f0f000", // 4: O (Yellow)
  "#00f000", // 5: S (Green)
  "#a000f0", // 6: T (Purple)
  "#f00000", // 7: Z (Red)
];

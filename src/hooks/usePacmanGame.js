import { useEffect, useState } from 'react';

const ROWS = 13;
const COLS = 13;
const CENTER = {
  row: Math.floor(ROWS / 2),
  col: Math.floor(COLS / 2),
};

const INTERNAL_WALLS = new Set([
  '3-3',
  '3-4',
  '3-8',
  '3-9',
  '6-1',
  '6-2',
  '6-10',
  '6-11',
  '9-3',
  '9-4',
  '9-8',
  '9-9',
]);

const keyToDirection = {
  ArrowUp: { deltaRow: -1, deltaCol: 0 },
  ArrowDown: { deltaRow: 1, deltaCol: 0 },
  ArrowLeft: { deltaRow: 0, deltaCol: -1 },
  ArrowRight: { deltaRow: 0, deltaCol: 1 },
};

const isWall = (row, col) => {
  const isOuterWall = row === 0 || col === 0 || row === ROWS - 1 || col === COLS - 1;
  return isOuterWall || INTERNAL_WALLS.has(`${row}-${col}`);
};

const createBoard = () =>
  Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => {
      const wall = isWall(row, col);

      return {
        row,
        col,
        isWall: wall,
        hasDot: !wall,
      };
    }),
  );

export const usePacmanGame = () => {
  const [gameState, setGameState] = useState(() => ({
    pacman: CENTER,
    score: 0,
    grid: createBoard(),
  }));

  useEffect(() => {
    const handleKeyDown = (event) => {
      const direction = keyToDirection[event.key];
      if (!direction) {
        return;
      }

      const { deltaRow, deltaCol } = direction;

      setGameState((prev) => {
        const nextRow = prev.pacman.row + deltaRow;
        const nextCol = prev.pacman.col + deltaCol;

        if (isWall(nextRow, nextCol)) {
          return prev;
        }

        const targetCell = prev.grid[nextRow][nextCol];
        const ateDot = targetCell.hasDot;

        let nextGrid = prev.grid;
        if (ateDot) {
          nextGrid = prev.grid.map((row) => row.map((cell) => ({ ...cell })));
          nextGrid[nextRow][nextCol].hasDot = false;
        }

        return {
          pacman: { row: nextRow, col: nextCol },
          score: ateDot ? prev.score + 10 : prev.score,
          grid: nextGrid,
        };
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    score: gameState.score,
    board: {
      grid: gameState.grid,
      pacman: gameState.pacman,
    },
  };
};

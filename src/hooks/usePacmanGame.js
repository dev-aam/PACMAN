import { useEffect, useMemo, useState } from 'react';

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
    Array.from({ length: COLS }, (_, col) => ({
      row,
      col,
      isWall: isWall(row, col),
    })),
  );

export const usePacmanGame = () => {
  const [score] = useState(0);
  const [pacmanPosition, setPacmanPosition] = useState(CENTER);

  const grid = useMemo(() => createBoard(), []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const direction = keyToDirection[event.key];
      if (!direction) {
        return;
      }

      const { deltaRow, deltaCol } = direction;

      setPacmanPosition((prev) => {
        const nextRow = prev.row + deltaRow;
        const nextCol = prev.col + deltaCol;

        if (isWall(nextRow, nextCol)) {
          return prev;
        }

        return {
          row: prev.row + deltaRow,
          col: prev.col + deltaCol,
        };
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    score,
    board: {
      grid,
      pacman: pacmanPosition,
    },
  };
};

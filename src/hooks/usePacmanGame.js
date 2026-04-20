import { useEffect, useState } from 'react';

const ROWS = 13;
const COLS = 13;
const CENTER = {
  row: Math.floor(ROWS / 2),
  col: Math.floor(COLS / 2),
};

const INITIAL_GHOSTS = [
  { row: 1, col: 1 },
  { row: 11, col: 11 },
];

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

const DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

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

const hasCollision = (ghosts, pacman) =>
  ghosts.some((ghost) => ghost.row === pacman.row && ghost.col === pacman.col);

const moveGhosts = (prevGhosts, grid) => {
  const occupiedPositions = new Set(prevGhosts.map((ghost) => `${ghost.row}-${ghost.col}`));

  return prevGhosts.map((ghost) => {
    const randomDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const newRow = ghost.row + randomDir.row;
    const newCol = ghost.col + randomDir.col;

    const nextCell = grid[newRow]?.[newCol];
    if (!nextCell || nextCell.isWall) {
      return ghost;
    }

    const currentKey = `${ghost.row}-${ghost.col}`;
    const nextKey = `${newRow}-${newCol}`;

    occupiedPositions.delete(currentKey);
    if (occupiedPositions.has(nextKey)) {
      occupiedPositions.add(currentKey);
      return ghost;
    }

    occupiedPositions.add(nextKey);
    return { row: newRow, col: newCol };
  });
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

const createInitialGameState = () => ({
  pacman: CENTER,
  score: 0,
  grid: createBoard(),
});

export const usePacmanGame = () => {
  const [gameState, setGameState] = useState(createInitialGameState);
  const [ghosts, setGhosts] = useState(INITIAL_GHOSTS);
  const [gameOver, setGameOver] = useState(false);

  const restartGame = () => {
    setGameState(createInitialGameState());
    setGhosts(INITIAL_GHOSTS);
    setGameOver(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameOver) {
        return;
      }

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

        const pacmanNextPosition = { row: nextRow, col: nextCol };
        if (hasCollision(ghosts, pacmanNextPosition)) {
          setGameOver(true);
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
  }, [gameOver, ghosts]);

  useEffect(() => {
    if (gameOver) {
      return undefined;
    }

    const interval = setInterval(() => {
      setGhosts((prevGhosts) => {
        const nextGhosts = moveGhosts(prevGhosts, gameState.grid);

        if (hasCollision(nextGhosts, gameState.pacman) || hasCollision(prevGhosts, gameState.pacman)) {
          setGameOver(true);
        }

        return nextGhosts;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [gameOver, gameState.grid, gameState.pacman]);

  return {
    score: gameState.score,
    gameOver,
    restartGame,
    board: {
      grid: gameState.grid,
      pacman: gameState.pacman,
    },
    ghosts,
  };
};

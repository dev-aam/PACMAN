import { useEffect, useRef, useState } from 'react';

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

const POWER_PELLETS = new Set(['1-1', '11-11']);

const NEIGHBOR_DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

const keyToDirection = {
  ArrowUp: { deltaRow: -1, deltaCol: 0, facing: 'up' },
  ArrowDown: { deltaRow: 1, deltaCol: 0, facing: 'down' },
  ArrowLeft: { deltaRow: 0, deltaCol: -1, facing: 'left' },
  ArrowRight: { deltaRow: 0, deltaCol: 1, facing: 'right' },
};

const posKey = (pos) => `${pos.row}-${pos.col}`;

const isWall = (row, col) => {
  const isOuterWall = row === 0 || col === 0 || row === ROWS - 1 || col === COLS - 1;
  return isOuterWall || INTERNAL_WALLS.has(`${row}-${col}`);
};

const hasCollision = (ghosts, pacman) =>
  ghosts.some((ghost) => ghost.row === pacman.row && ghost.col === pacman.col);

const getCollisionIndexes = (ghosts, pacman) =>
  ghosts
    .map((ghost, index) => ({ ghost, index }))
    .filter(({ ghost }) => ghost.row === pacman.row && ghost.col === pacman.col)
    .map(({ index }) => index);

const getNeighbors = (pos) =>
  NEIGHBOR_DIRECTIONS.map((direction) => ({
    row: pos.row + direction.row,
    col: pos.col + direction.col,
  }));

const bfs = (start, target, grid) => {
  const queue = [start];
  const visited = new Set([posKey(start)]);
  const parent = {};

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.row === target.row && current.col === target.col) {
      break;
    }

    for (const neighbor of getNeighbors(current)) {
      const neighborKey = posKey(neighbor);
      const cell = grid[neighbor.row]?.[neighbor.col];

      if (!cell || cell.isWall || visited.has(neighborKey)) {
        continue;
      }

      queue.push(neighbor);
      visited.add(neighborKey);
      parent[neighborKey] = current;
    }
  }

  const path = [];
  let current = target;

  while (current && posKey(current) !== posKey(start)) {
    path.push(current);
    current = parent[posKey(current)];
  }

  return path.reverse();
};

const getRandomMove = (ghost, grid, occupiedPositions) => {
  const shuffled = [...NEIGHBOR_DIRECTIONS].sort(() => Math.random() - 0.5);

  for (const direction of shuffled) {
    const next = {
      row: ghost.row + direction.row,
      col: ghost.col + direction.col,
    };

    const nextCell = grid[next.row]?.[next.col];
    if (!nextCell || nextCell.isWall || occupiedPositions.has(posKey(next))) {
      continue;
    }

    return next;
  }

  return ghost;
};

const moveGhosts = (prevGhosts, pacman, grid, powerMode) => {
  const occupiedPositions = new Set(prevGhosts.map((ghost) => posKey(ghost)));

  return prevGhosts.map((ghost) => {
    const currentKey = posKey(ghost);
    occupiedPositions.delete(currentKey);

    const nextStep = powerMode
      ? getRandomMove(ghost, grid, occupiedPositions)
      : bfs(ghost, pacman, grid)[0] || ghost;

    const nextKey = posKey(nextStep);

    if (occupiedPositions.has(nextKey)) {
      occupiedPositions.add(currentKey);
      return ghost;
    }

    occupiedPositions.add(nextKey);
    return nextStep;
  });
};

const createBoard = () =>
  Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => {
      const wall = isWall(row, col);
      const isPower = POWER_PELLETS.has(`${row}-${col}`);

      return {
        row,
        col,
        isWall: wall,
        isPower,
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
  const [powerMode, setPowerMode] = useState(false);
  const [direction, setDirection] = useState('right');
  const powerTimeoutRef = useRef(null);

  const triggerPowerMode = () => {
    setPowerMode(true);

    if (powerTimeoutRef.current) {
      clearTimeout(powerTimeoutRef.current);
    }

    powerTimeoutRef.current = setTimeout(() => {
      setPowerMode(false);
    }, 5000);
  };

  const restartGame = () => {
    setGameState(createInitialGameState());
    setGhosts(INITIAL_GHOSTS);
    setGameOver(false);
    setPowerMode(false);
    setDirection('right');

    if (powerTimeoutRef.current) {
      clearTimeout(powerTimeoutRef.current);
      powerTimeoutRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (powerTimeoutRef.current) {
        clearTimeout(powerTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameOver) {
        return;
      }

      const directionConfig = keyToDirection[event.key];
      if (!directionConfig) {
        return;
      }

      setDirection(directionConfig.facing);

      const { deltaRow, deltaCol } = directionConfig;

      setGameState((prev) => {
        const nextRow = prev.pacman.row + deltaRow;
        const nextCol = prev.pacman.col + deltaCol;

        if (isWall(nextRow, nextCol)) {
          return prev;
        }

        const pacmanNextPosition = { row: nextRow, col: nextCol };
        const collidedIndexes = getCollisionIndexes(ghosts, pacmanNextPosition);

        let ghostScoreBonus = 0;
        if (collidedIndexes.length > 0) {
          if (powerMode) {
            ghostScoreBonus = collidedIndexes.length * 50;
            setGhosts((prevGhosts) =>
              prevGhosts.map((ghost, index) =>
                collidedIndexes.includes(index) ? { ...INITIAL_GHOSTS[index] } : ghost,
              ),
            );
          } else {
            setGameOver(true);
          }
        }

        const targetCell = prev.grid[nextRow][nextCol];
        const ateDot = targetCell.hasDot;

        if (ateDot && targetCell.isPower) {
          triggerPowerMode();
        }

        let nextGrid = prev.grid;
        if (ateDot) {
          nextGrid = prev.grid.map((row) => row.map((cell) => ({ ...cell })));
          nextGrid[nextRow][nextCol].hasDot = false;
        }

        return {
          pacman: pacmanNextPosition,
          score: prev.score + (ateDot ? 10 : 0) + ghostScoreBonus,
          grid: nextGrid,
        };
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameOver, ghosts, powerMode]);

  useEffect(() => {
    if (gameOver) {
      return undefined;
    }

    const interval = setInterval(() => {
      setGhosts((prevGhosts) => {
        const nextGhosts = moveGhosts(prevGhosts, gameState.pacman, gameState.grid, powerMode);
        const collidedIndexes = getCollisionIndexes(nextGhosts, gameState.pacman);

        if (collidedIndexes.length > 0) {
          if (powerMode) {
            setGameState((prev) => ({
              ...prev,
              score: prev.score + collidedIndexes.length * 50,
            }));

            return nextGhosts.map((ghost, index) =>
              collidedIndexes.includes(index) ? { ...INITIAL_GHOSTS[index] } : ghost,
            );
          }

          setGameOver(true);
        }

        if (hasCollision(prevGhosts, gameState.pacman) && !powerMode) {
          setGameOver(true);
        }

        return nextGhosts;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [gameOver, gameState.grid, gameState.pacman, powerMode]);

  return {
    score: gameState.score,
    gameOver,
    powerMode,
    direction,
    restartGame,
    board: {
      grid: gameState.grid,
      pacman: gameState.pacman,
    },
    ghosts,
  };
};

import Pacman from './Pacman';

function Cell({ cell, pacman, isGhost }) {
  const hasPacman = pacman.row === cell.row && pacman.col === cell.col;

  return (
    <div className={`cell ${cell.isWall ? 'wall' : 'path'}`}>
      {!cell.isWall && cell.hasDot && !hasPacman && !isGhost ? (
        <span className="dot" aria-hidden="true" />
      ) : null}
      {isGhost ? <div className="ghost" aria-label="Ghost" /> : null}
      {hasPacman ? <Pacman /> : null}
    </div>
  );
}

export default Cell;

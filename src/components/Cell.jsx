import Pacman from './Pacman';

function Cell({ cell, pacman, isGhost, direction }) {
  const hasPacman = pacman.row === cell.row && pacman.col === cell.col;

  return (
    <div className={`cell ${cell.isWall ? 'wall' : 'path'}`}>
      {!cell.isWall && cell.hasDot && !hasPacman && !isGhost ? (
        <span className={`dot ${cell.isPower ? 'power' : ''}`} aria-hidden="true" />
      ) : null}
      {isGhost ? <div className="ghost" aria-label="Ghost" /> : null}
      {hasPacman ? <Pacman direction={direction} /> : null}
    </div>
  );
}

export default Cell;

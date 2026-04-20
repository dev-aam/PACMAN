import Pacman from './Pacman';

function Cell({ cell, pacman }) {
  const hasPacman = pacman.row === cell.row && pacman.col === cell.col;

  return (
    <div className={`cell ${cell.isWall ? 'wall' : 'path'}`}>
      {!cell.isWall && cell.hasDot && !hasPacman ? (
        <span className="dot" aria-hidden="true" />
      ) : null}
      {hasPacman ? <Pacman /> : null}
    </div>
  );
}

export default Cell;

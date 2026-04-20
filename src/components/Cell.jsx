import Pacman from './Pacman';

function Cell({ cell, pacman }) {
  const hasPacman = pacman.row === cell.row && pacman.col === cell.col;

  return (
    <div className={`cell ${cell.isWall ? 'wall' : 'path'}`}>
      {hasPacman ? <Pacman /> : null}
    </div>
  );
}

export default Cell;

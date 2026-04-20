import Cell from './Cell';

function GameBoard({ board, ghosts, direction }) {
  return (
    <section className="game-board" aria-label="Pacman game board">
      {board.grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            pacman={board.pacman}
            direction={direction}
            isGhost={ghosts.some((ghost) => ghost.row === rowIndex && ghost.col === colIndex)}
          />
        )),
      )}
    </section>
  );
}

export default GameBoard;

import Cell from './Cell';

function GameBoard({ board }) {
  return (
    <section className="game-board" aria-label="Pacman game board">
      {board.grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            pacman={board.pacman}
          />
        )),
      )}
    </section>
  );
}

export default GameBoard;

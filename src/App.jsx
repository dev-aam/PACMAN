import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import { usePacmanGame } from './hooks/usePacmanGame';
import './styles/app.css';

function App() {
  const { board, score, ghosts, gameOver, restartGame, powerMode, direction } = usePacmanGame();

  return (
    <main className="app">
      <h1>Pacman</h1>
      <ScoreBoard score={score} />
      {powerMode ? <p className="power-mode">Power Mode!</p> : null}
      <div className="game-container">
        {gameOver ? (
          <div className="game-over">
            <h2>Game Over</h2>
            <button type="button" onClick={restartGame}>
              Restart
            </button>
          </div>
        ) : null}
        <GameBoard board={board} ghosts={ghosts} direction={direction} />
      </div>
    </main>
  );
}

export default App;

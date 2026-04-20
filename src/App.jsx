import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import { usePacmanGame } from './hooks/usePacmanGame';
import './styles/app.css';

function App() {
  const { board, score } = usePacmanGame();

  return (
    <main className="app">
      <h1>Pacman</h1>
      <ScoreBoard score={score} />
      <GameBoard board={board} />
    </main>
  );
}

export default App;

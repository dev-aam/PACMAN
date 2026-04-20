function ScoreBoard({ score }) {
  return (
    <section className="score-board" aria-live="polite">
      <h2>Score</h2>
      <p>{score}</p>
    </section>
  );
}

export default ScoreBoard;

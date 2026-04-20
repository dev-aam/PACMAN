function Pacman({ direction = 'right' }) {
  return <span className={`pacman ${direction}`} aria-label="Pacman" />;
}

export default Pacman;

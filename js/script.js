// ---------- Floating petals ----------
(function petals() {
  const container = document.querySelector('.petals');
  const symbols = ['🩵', '✨', '🦊', '⭐'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animationDuration = 8 + Math.random() * 10 + 's';
    petal.style.animationDelay = Math.random() * 10 + 's';
    petal.style.fontSize = 0.9 + Math.random() * 1.2 + 'rem';
    container.appendChild(petal);
  }
})();

// ---------- Fade-in on scroll ----------
(function fadeInOnScroll() {
  const items = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((item) => observer.observe(item));
})();

// ---------- Sliding puzzle (3x3) ----------
(function slidingPuzzle() {
  const SIZE = 3;
  const EMPTY = 0;
  const board = document.getElementById('puzzle-board');
  const statusEl = document.getElementById('puzzle-status');
  const shuffleBtn = document.getElementById('puzzle-shuffle');
  const revealSection = document.getElementById('reveal');

  // Prefer a real couple photo if the visitor adds one; otherwise use the themed placeholder.
  const customImage = 'assets/img/puzzle.jpg';
  const fallbackImage = 'assets/img/puzzle.svg';
  let puzzleImage = fallbackImage;

  let tiles = [];
  let solved = false;

  function preloadImage() {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(customImage);
      img.onerror = () => resolve(fallbackImage);
      img.src = customImage;
    });
  }

  function solvedArray() {
    const arr = [];
    for (let i = 1; i < SIZE * SIZE; i++) arr.push(i);
    arr.push(EMPTY);
    return arr;
  }

  function isSolvable(arr) {
    const withoutEmpty = arr.filter((n) => n !== EMPTY);
    let inversions = 0;
    for (let i = 0; i < withoutEmpty.length; i++) {
      for (let j = i + 1; j < withoutEmpty.length; j++) {
        if (withoutEmpty[i] > withoutEmpty[j]) inversions++;
      }
    }
    return inversions % 2 === 0;
  }

  function shuffle() {
    let arr;
    do {
      arr = solvedArray();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    } while (!isSolvable(arr) || isSolved(arr));
    tiles = arr;
    solved = false;
    render();
    statusEl.textContent = '';
  }

  function isSolved(arr) {
    const target = solvedArray();
    return arr.every((v, i) => v === target[i]);
  }

  function tileBackgroundPosition(value) {
    const index = value - 1; // 0-based position of this number in the solved grid
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    const step = 100 / (SIZE - 1);
    return `${col * step}% ${row * step}%`;
  }

  function render() {
    board.innerHTML = '';
    tiles.forEach((value, i) => {
      const tile = document.createElement('div');
      tile.className = 'puzzle-tile' + (value === EMPTY ? ' empty' : '');
      if (value !== EMPTY) {
        tile.style.backgroundImage = `url('${puzzleImage}')`;
        tile.style.backgroundPosition = tileBackgroundPosition(value);
        tile.addEventListener('click', () => attemptMove(i));
      }
      board.appendChild(tile);
    });
  }

  function attemptMove(index) {
    if (solved) return;
    const emptyIndex = tiles.indexOf(EMPTY);
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    const emptyRow = Math.floor(emptyIndex / SIZE);
    const emptyCol = emptyIndex % SIZE;

    const isAdjacent =
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1);

    if (!isAdjacent) return;

    [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
    render();

    if (isSolved(tiles)) {
      solved = true;
      statusEl.textContent = 'Você resolveu! 💖';
      unlockReveal();
    }
  }

  function unlockReveal() {
    revealSection.classList.remove('locked');
    revealSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    launchConfetti();
  }

  shuffleBtn.addEventListener('click', shuffle);

  preloadImage().then((src) => {
    puzzleImage = src;
    shuffle();
  });
})();

// ---------- Confetti burst on reveal ----------
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('reveal');

  function resize() {
    canvas.width = section.clientWidth;
    canvas.height = section.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#ffffff', '#22d3ee', '#67e8f9', '#0891b2'];
  const particles = Array.from({ length: 120 }, () => ({
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: (Math.random() - 0.5) * 10,
    vy: (Math.random() - 1) * 10,
    size: 4 + Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 80 + Math.random() * 40,
  }));

  let frame = 0;
  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25;
      p.life--;
      ctx.globalAlpha = Math.max(p.life / 120, 0);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    if (frame < 140) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();
}

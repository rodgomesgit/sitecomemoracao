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
  let moveCount = 0;
  let dialog1Shown = false;
  let dialog2Shown = false;
  let dialog3Shown = false;

  const SECRET_WORDS = ['jujuba', 'ninho', 'devaneio'];

  const dialogOverlay = document.getElementById('puzzle-dialog');
  const dialogText = document.getElementById('puzzle-dialog-text');
  const dialogBtn = document.getElementById('puzzle-dialog-btn');
  const dialogForm = document.getElementById('puzzle-dialog-form');
  const dialogQuestion = document.getElementById('puzzle-dialog-question');
  const dialogInput = document.getElementById('puzzle-dialog-input');
  const dialogError = document.getElementById('puzzle-dialog-error');

  function showDialog(message, buttonLabel, onConfirm) {
    dialogText.textContent = message;
    dialogForm.hidden = true;
    dialogBtn.textContent = buttonLabel;
    dialogOverlay.hidden = false;
    dialogBtn.onclick = () => {
      dialogOverlay.hidden = true;
      onConfirm();
    };
  }

  function normalizeWords(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .split(/[^a-z]+/)
      .filter(Boolean);
  }

  function showPasswordDialog(message, question, answerWords, onSuccess) {
    dialogText.textContent = message;
    dialogQuestion.textContent = question;
    dialogInput.value = '';
    dialogError.hidden = true;
    dialogForm.hidden = false;
    dialogBtn.textContent = 'Responder';
    dialogOverlay.hidden = false;
    dialogInput.focus();

    dialogBtn.onclick = () => {
      const givenWords = normalizeWords(dialogInput.value);
      const isCorrect = answerWords.every((word) => givenWords.includes(word));
      if (isCorrect) {
        dialogOverlay.hidden = true;
        onSuccess();
      } else {
        dialogError.textContent = 'Não é isso... tenta de novo. 💭';
        dialogError.hidden = false;
      }
    };
  }

  dialogInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') dialogBtn.click();
  });

  function checkTeasingDialogs() {
    if (!dialog1Shown && moveCount >= 50) {
      dialog1Shown = true;
      showDialog(
        'Não conseguiu desvendar? Que pena... Não vai conseguir descobrir a surpresa...',
        'Tentar de novo',
        () => shuffle()
      );
    } else if (dialog1Shown && !dialog2Shown && moveCount >= 20) {
      dialog2Shown = true;
      showDialog('Está bem, vou te dar uma colher de chá', 'Usar dica', () => {
        giveHint();
        moveCount = 0;
      });
    } else if (dialog2Shown && !dialog3Shown && moveCount >= 20) {
      dialog3Shown = true;
      showPasswordDialog(
        'É, realmente não tem jeito, você é péssimo nisso. Mas eu vou te ajudar. Responda a seguinte pergunta e você vai acessar a surpresa.',
        'Quais são os nossos códigos?',
        SECRET_WORDS,
        () => {
          solved = true;
          statusEl.textContent = 'Você conseguiu! 💖';
          unlockReveal();
        }
      );
    }
  }

  // Solves the current board with a breadth-first search and returns the
  // index of the tile to click for the first move toward the solution.
  function findHintMove(startTiles) {
    const targetKey = solvedArray().join(',');
    const startKey = startTiles.join(',');
    if (startKey === targetKey) return null;

    const queue = [startTiles];
    const cameFrom = new Map([[startKey, null]]);

    while (queue.length) {
      const current = queue.shift();
      const key = current.join(',');
      if (key === targetKey) break;

      const emptyIndex = current.indexOf(EMPTY);
      const row = Math.floor(emptyIndex / SIZE);
      const col = emptyIndex % SIZE;
      const candidates = [];
      if (row > 0) candidates.push(emptyIndex - SIZE);
      if (row < SIZE - 1) candidates.push(emptyIndex + SIZE);
      if (col > 0) candidates.push(emptyIndex - 1);
      if (col < SIZE - 1) candidates.push(emptyIndex + 1);

      for (const n of candidates) {
        const next = current.slice();
        [next[emptyIndex], next[n]] = [next[n], next[emptyIndex]];
        const nextKey = next.join(',');
        if (!cameFrom.has(nextKey)) {
          cameFrom.set(nextKey, { prevKey: key, moveIndex: n });
          queue.push(next);
        }
      }
    }

    if (!cameFrom.has(targetKey)) return null;

    let key = targetKey;
    let firstMove = null;
    while (cameFrom.get(key)) {
      const entry = cameFrom.get(key);
      firstMove = entry.moveIndex;
      key = entry.prevKey;
    }
    return firstMove;
  }

  function giveHint() {
    const moveIndex = findHintMove(tiles);
    if (moveIndex == null) return;
    const tileEl = board.children[moveIndex];
    if (!tileEl) return;
    tileEl.classList.add('puzzle-hint');
    setTimeout(() => tileEl.classList.remove('puzzle-hint'), 3000);
  }

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
    moveCount = 0;
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
    moveCount++;
    render();

    if (isSolved(tiles)) {
      solved = true;
      statusEl.textContent = 'Você resolveu! 💖';
      unlockReveal();
      return;
    }

    checkTeasingDialogs();
  }

  function unlockReveal() {
    revealSection.classList.remove('locked');
    revealSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    launchConfetti();
  }

  shuffleBtn.addEventListener('click', () => {
    dialog1Shown = false;
    dialog2Shown = false;
    dialog3Shown = false;
    shuffle();
  });

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

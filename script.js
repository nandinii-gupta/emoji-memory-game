const board            = document.getElementById("game-board");
const movesEl          = document.getElementById("move-counter");
const timerEl          = document.getElementById("timer");
const toggleDarkBtn    = document.getElementById("toggle-dark");
const resetBtn         = document.getElementById("reset-game");
const difficultySelect = document.getElementById("difficulty");
const pauseBtn         = document.getElementById("pause-timer");

const music            = document.getElementById("bg-music");
const musicToggleBtn   = document.getElementById("music-toggle");
const winSound         = document.getElementById("win-sound");
const matchSound       = document.getElementById("match-sound");

const victoryModal     = document.getElementById("victory-modal");
const victoryMsg       = document.getElementById("victory-message");
const playAgainBtn     = document.getElementById("play-again");


const matchModal = document.createElement("div");
matchModal.id = "match-overlay";
matchModal.style.display = "none";
matchModal.innerHTML = `<div class="match-animation"><p>✨ Match Found! ✨</p></div>`;
document.body.appendChild(matchModal);

// ------- Emoji Sets ------- //
const emojiSets = {
  easy:   ["💼","📈","📎","🖥️","🧾","📊","📅","📌"],
  medium: ["💼","📈","📎","🖥️","🧾","📊","📅","📌","📇","🗂️","🖋️","📉"],
  hard:   ["💼","📈","📎","🖥️","🧾","📊","📅","📌","📇","🗂️","🖋️","📉","🧮","🪙","📝","🔒"]
};

// ------- Game State ------- //
let emojis = [], flipped = [], matchedPairs = 0;
let moves = 0, startTime = 0, timerInterval = null;
let timerPaused = false, pausedOffset = 0;
let musicStarted = false;


const shuffle = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

// ------- Timer ------- //
function updateTimer() {
  if (timerPaused) return;
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  timerEl.textContent = `Time: ${seconds}s`;
}

function startTimer() {
  clearInterval(timerInterval);
  startTime = Date.now() - pausedOffset;
  timerInterval = setInterval(updateTimer, 1000);
}

function pauseTimer() {
  timerPaused = true;
  clearInterval(timerInterval);
  pausedOffset = Date.now() - startTime;
  pauseBtn.textContent = "▶️";
}

function resumeTimer() {
  timerPaused = false;
  startTimer();
  pauseBtn.textContent = "⏸️";
}

// ------- Board Creation ------- //
function createBoard(difficulty = "easy") {
  board.innerHTML = "";
  emojis = [...emojiSets[difficulty]];
  const cards = [...emojis, ...emojis];
  shuffle(cards);

  moves = 0; matchedPairs = 0; flipped = [];
  movesEl.textContent  = "Moves: 0";
  timerEl.textContent  = "Time: 0s";

  pausedOffset = 0;
  timerPaused  = false;
  startTimer();

  // const gridCols = Math.ceil(Math.sqrt(cards.length));
  // board.style.gridTemplateColumns = `repeat(${gridCols}, minmax(70px, 1fr))`;

  // Create card elements
  cards.forEach(emoji => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.emoji = emoji;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">${emoji}</div>
      </div>`;
    card.addEventListener("click", handleFlip);
    board.appendChild(card);
  });
}

// ------- Card Flip Logic ------- //
function handleFlip() {
  if (!musicStarted) {
    music.muted  = false;
    music.volume = 0.4;
    music.play().catch(() => {});
    musicStarted = true;
  }

  if (timerPaused) resumeTimer();           // resume if paused
  if (flipped.length === 2 || this.classList.contains("flipped") || this.classList.contains("matched")) return;

  this.classList.add("flipped");
  flipped.push(this);

  if (flipped.length === 2) {
    moves++;
    movesEl.textContent = `Moves: ${moves}`;
    checkMatch();
  }
}

// ------- Match Logic ------- //
function showMatchAnimation(emoji) {
  matchModal.innerHTML = `
    <div class="match-animation">
      <div class="card-showcase">${emoji}</div>
      <div class="card-showcase">${emoji}</div>
      <p>✨ Match Found! ✨</p>
    </div>`;
  matchModal.style.display = "flex";
  setTimeout(() => (matchModal.style.display = "none"), 1200);
}

function checkMatch() {
  const [c1, c2] = flipped;
  if (c1.dataset.emoji === c2.dataset.emoji) {
    c1.classList.replace("flipped", "matched");
    c2.classList.replace("flipped", "matched");

    matchSound.currentTime = 0;
    matchSound.play().catch(() => {});

    showMatchAnimation(c1.dataset.emoji);
    flipped = [];
    matchedPairs++;

    if (matchedPairs === emojis.length) {
      clearInterval(timerInterval);
      setTimeout(showVictory, 600);
    }
  } else {
    setTimeout(() => {
      c1.classList.remove("flipped");
      c2.classList.remove("flipped");
      flipped = [];
    }, 800);
  }
}

// ------- Victory ------- //
function triggerConfetti() {
  if (typeof confetti === "function") {
    confetti({ particleCount: 250, spread: 100, origin: { y: 0.6 } });
  }
}

function showVictory() {
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  victoryMsg.textContent = `You crushed it in ${moves} moves and ${timeTaken} seconds! 🌟`;
  victoryModal.classList.add("show");
  triggerConfetti();
  music.pause();

  winSound.currentTime = 0;
  winSound.play().catch(() => {});
}

// ------- Reset / Controls ------- //
function resetGame() {
  victoryModal.classList.remove("show");
  music.currentTime = 0;
  if (!music.muted) music.play().catch(() => {});
  createBoard(difficultySelect.value);
}

resetBtn.addEventListener("click", resetGame);
difficultySelect.addEventListener("change", resetGame);
playAgainBtn.addEventListener("click", resetGame);

toggleDarkBtn.addEventListener("click", () => document.body.classList.toggle("dark"));

musicToggleBtn.addEventListener("click", () => {
  music.muted = !music.muted;
  musicToggleBtn.textContent = music.muted ? "🔇" : "🔊";
});

pauseBtn.addEventListener("click", () => {
  if (timerPaused) {
    resumeTimer();
  } else {
    pauseTimer();
  }
});

createBoard();



















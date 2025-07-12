const board           = document.getElementById("game-board");
const movesEl         = document.getElementById("move-counter");
const timerEl         = document.getElementById("timer");
const toggleDarkBtn   = document.getElementById("toggle-dark");
const resetBtn        = document.getElementById("reset-game");
const difficultySelect= document.getElementById("difficulty");
const music           = document.getElementById("bg-music");
const musicToggleBtn  = document.getElementById("music-toggle");
const victoryModal    = document.getElementById("victory-modal");
const victoryMsg      = document.getElementById("victory-message");
const playAgainBtn    = document.getElementById("play-again");
const winSound        = document.getElementById("win-sound");
const matchSound      = document.getElementById("match-sound");



// Create match overlay modal
const matchModal = document.createElement("div");
matchModal.id = "match-overlay";
matchModal.innerHTML = `
  <div class="match-message">
    <p>✨ Match Found! ✨</p>
  </div>
`;
matchModal.style.display = "none";
document.body.appendChild(matchModal);

const emojiSets = {
  easy  : ["💼","📈","📎","🖥️","🧾","📊","📅","📌"],
  medium: ["💼","📈","📎","🖥️","🧾","📊","📅","📌","📇","🗂️","🖋️","📉"],
  hard  : ["💼","📈","📎","🖥️","🧾","📊","📅","📌","📇","🗂️","🖋️","📉","🧮","🪙","📝","🔒"]
};

let emojis = [], flipped = [], matchedPairs = 0, moves = 0, startTime = 0;
let timerInterval = null, timerPaused = false, musicStarted = false;


function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function updateTimer() {
  if (timerPaused) return;
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  timerEl.textContent = `Time: ${seconds}s`;
}

function pauseTimer() {
  timerPaused = true;
}

function resumeTimer() {
  timerPaused = false;
}


function createBoard(difficulty = "easy") {
  board.innerHTML = "";
  emojis = emojiSets[difficulty];
  const cards = [...emojis, ...emojis];
  shuffle(cards);

  const gridSide = Math.ceil(Math.sqrt(cards.length));
  board.style.gridTemplateColumns = `repeat(${gridSide}, 1fr)`;

  moves = 0; matchedPairs = 0; flipped = [];
  movesEl.textContent = "Moves: 0";
  timerEl.textContent = "Time: 0s";

  clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);

  cards.forEach(emoji => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.emoji = emoji;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">${emoji}</div>
      </div>
    `;
    card.addEventListener("click", handleFlip);
    board.appendChild(card);
  });
}

function handleFlip() {
  if (!musicStarted) {
  music.muted = false;
  music.volume = 0.4;
  music.play()
    .then(() => console.log("Music started"))
    .catch((err) => console.error("Music failed to play:", err));
  musicStarted = true;
}

  if (flipped.length === 2 || this.classList.contains("flipped") || this.classList.contains("matched")) return;

  this.classList.add("flipped");
  flipped.push(this);

  if (flipped.length === 2) {
    moves++;
    movesEl.textContent = `Moves: ${moves}`;
    checkMatch();
  }
}

function showMatchAnimation(c1, c2) {
  const emoji = c1.dataset.emoji;
  const clone1 = c1.cloneNode(true);
  const clone2 = c2.cloneNode(true);

  const overlay = document.getElementById("match-overlay");
  overlay.innerHTML = `
    <div class="match-animation">
      <div class="card-showcase">${emoji}</div>
      <div class="card-showcase">${emoji}</div>
      <p>✨ Match Found! ✨</p>
    </div>
  `;

  overlay.style.display = "flex";
  setTimeout(() => overlay.style.display = "none", 1300);
}



function checkMatch() {
  const [c1, c2] = flipped;
  if (c1.dataset.emoji === c2.dataset.emoji) {
    c1.classList.replace("flipped", "matched");
    c2.classList.replace("flipped", "matched");
    showMatchAnimation(c1, c2);
    // ✅ Play match sound
    matchSound.currentTime = 0;
    matchSound.play().catch(() => {});
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

  // Play victory sound
  winSound.currentTime = 0;
  winSound.play().catch(() => {});
}

function resetGame() {
  victoryModal.classList.remove("show");
  music.currentTime = 0;

  music.muted = false;           // ✅ Unmute explicitly
  music.volume = 0.4;            // ✅ Set reasonable volume
  if (!music.muted) music.play().catch(() => {});

  createBoard(difficultySelect.value);
}


toggleDarkBtn.addEventListener("click", () => document.body.classList.toggle("dark"));
resetBtn.addEventListener("click", resetGame);
difficultySelect.addEventListener("change", resetGame);
playAgainBtn.addEventListener("click", resetGame);

musicToggleBtn.addEventListener("click", () => {
  music.muted = !music.muted;
  musicToggleBtn.textContent = music.muted ? "🔇" : "🔊";
});

const pauseBtn = document.getElementById("pause-timer");

pauseBtn.addEventListener("click", () => {
  timerPaused = !timerPaused;
  pauseBtn.textContent = timerPaused ? "▶️" : "⏸️";
});

createBoard();







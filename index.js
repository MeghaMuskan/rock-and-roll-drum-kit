/* ─────────────────────────────────────────
   Rock & Roll Drum Kit — main script
   ───────────────────────────────────────── */

const soundMap = {
  w: "./sounds/tom-1.mp3",
  a: "./sounds/tom-2.mp3",
  s: "./sounds/tom-3.mp3",
  d: "./sounds/tom-4.mp3",
  j: "./sounds/snare.mp3",
  k: "./sounds/crash.mp3",
  l: "./sounds/kick-bass.mp3"
};

const padAccents = {
  w: "#e8350a",
  a: "#c45ae8",
  s: "#5ae870",
  d: "#e8c840",
  j: "#e87040",
  k: "#40e8d0",
  l: "#408ae8"
};

const vinylColors = ["#e8350a", "#e8d5a0", "#c8a830", "#555555", "#8b0000"];

/* ── Web Audio context + buffer cache ── */
let audioCtx = null;
const buffers = {};

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

async function loadAllSounds() {
  const ctx = getAudioCtx();
  const promises = Object.entries(soundMap).map(async ([key, path]) => {
    try {
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      buffers[key] = await ctx.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.warn(`Could not load sound for key "${key}":`, err);
    }
  });
  await Promise.all(promises);
}

function playSound(key) {
  const ctx = getAudioCtx();
  if (!buffers[key]) return;

  if (ctx.state === "suspended") ctx.resume();

  const source = ctx.createBufferSource();
  source.buffer = buffers[key];
  source.connect(ctx.destination);
  source.start(0);
}

/* ── Waveform bars ── */
function buildWaveform(key) {
  const container = document.getElementById("wf-" + key);
  if (!container) return;

  container.innerHTML = "";
  const color = padAccents[key] || "#e8d5a0";
  const barCount = 14;

  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement("div");
    bar.className = "wbar";
    const height = Math.floor(5 + Math.random() * 20);
    bar.style.cssText = `
      background: ${color};
      --h: ${height}px;
      animation-delay: ${i * 0.025}s;
    `;
    container.appendChild(bar);
  }
}

/* ── Hit a pad ── */
function hitPad(key) {
  playSound(key);
  buildWaveform(key);

  const pad = document.querySelector(`.drum[data-key="${key}"]`);
  if (!pad) return;

  pad.classList.remove("pressed");
  void pad.offsetWidth; // force reflow to restart animation
  pad.classList.add("pressed");

  setTimeout(() => pad.classList.remove("pressed"), 200);
}

/* ── Landing: floating vinyl bubbles ── */
let vinylInterval = null;

function spawnVinylBubble() {
  const stage = document.getElementById("vinyl-stage");
  if (!stage) return;

  const size = 36 + Math.random() * 64;
  const left = Math.random() * 92;
  const duration = 2.2 + Math.random() * 2;
  const color = vinylColors[Math.floor(Math.random() * vinylColors.length)];
  const delay = Math.random() * 0.8;

  const bubble = document.createElement("div");
  bubble.className = "vinyl-bubble";
  bubble.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${left}%;
    background: ${color};
    border: ${Math.max(2, size * 0.05)}px solid rgba(255,255,255,0.1);
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
    bottom: -80px;
  `;

  /* inner hole */
  const hole = document.createElement("div");
  hole.style.cssText = `
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 28%;
    height: 28%;
    background: #0a0404;
    border-radius: 50%;
  `;
  bubble.appendChild(hole);
  stage.appendChild(bubble);

  setTimeout(() => bubble.remove(), (duration + delay + 0.5) * 1000);
}

function startVinylRain() {
  spawnVinylBubble();
  vinylInterval = setInterval(spawnVinylBubble, 280);
}

function stopVinylRain() {
  clearInterval(vinylInterval);
  vinylInterval = null;
}

/* ── CTA: transition from landing to drum kit ── */
function startShow() {
  startVinylRain();

  const overlay = document.getElementById("vinyl-overlay");
  overlay.classList.add("active");

  setTimeout(() => {
    overlay.classList.remove("active");
    stopVinylRain();

    document.getElementById("landing").style.display = "none";

    const drumSection = document.getElementById("drum-section");
    drumSection.classList.add("show");

    loadAllSounds();
  }, 1500);
}

/* ── Event listeners ── */
document.querySelectorAll(".drum").forEach(button => {
  button.addEventListener("click", () => {
    hitPad(button.getAttribute("data-key"));
  });

  button.addEventListener("touchstart", e => {
    e.preventDefault();
    hitPad(button.getAttribute("data-key"));
  }, { passive: false });
});

document.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();
  if (soundMap[key]) hitPad(key);
});

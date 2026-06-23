# 🥁 Rock & Roll Drum Kit

A vintage rock-themed interactive drum kit — designed in Figma, built from scratch with vanilla HTML, CSS, and JavaScript. No frameworks, no libraries, zero dependencies.

**[🎸 Live Demo →](https://MeghaMuskan.github.io/rock-and-roll-drum-kit)**

![Built with Vanilla JS](https://img.shields.io/badge/built%20with-vanilla%20JS-e8350a?style=for-the-badge&labelColor=120808)
![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-e8d5a0?style=for-the-badge&labelColor=120808)
![Designed in Figma](https://img.shields.io/badge/designed%20in-Figma-e8350a?style=for-the-badge&labelColor=120808)

---

## What it does

- **Vintage landing page** — rock & roll intro with floating vinyl record animation, cassette and vinyl pile background art, and an animated spinning-vinyl page transition
- **Interactive drum kit** — 7 pads (4 toms, snare, crash cymbal, kick bass) playable via click, touch, or keyboard
- **Low-latency audio** — Web Audio API buffer playback, sounds decoded and cached on load
- **Waveform animation** — randomized bar graph pulses on every hit, unique per pad
- **Per-pad glow** — each pad has its own accent color that lights up on press
- **Fully responsive** — works on desktop, tablet, and mobile

## Controls

| Key | Pad        |
|-----|------------|
| W   | Tom 1      |
| A   | Tom 2      |
| S   | Tom 3      |
| D   | Tom 4      |
| J   | Snare      |
| K   | Crash      |
| L   | Kick Bass  |

---

## Design Process — Figma First

**[🎨 View Full Figma Design File →](https://www.figma.com/design/82nIBSMCDUaB5qrIe7JvNR/Untitled?node-id=40-45&t=IRq4ywXqFJASTtr5-1)**

The drum kit UI was designed entirely in Figma before a single line of code was written.

### Desktop prototype — Smart Animate transitions
[![Figma Desktop Prototype](assets/figma-desktop.png)](https://www.figma.com/design/82nIBSMCDUaB5qrIe7JvNR/Untitled?node-id=40-45&t=IRq4ywXqFJASTtr5-1)

*Each pad has hover and pressed states connected with Smart Animate — this prototype was the spec for the CSS `pressed` animation timings.*

### Drum Kit component layout
[![Figma Component Layout](assets/figma-functional.png)](https://www.figma.com/design/82nIBSMCDUaB5qrIe7JvNR/Untitled?node-id=11-30&t=IRq4ywXqFJASTtr5-1)

*7 reusable `DrumPad` components, each with its own accent color — translated directly into CSS custom properties (`--tom1-accent`, `--snare-accent` etc.)*

**What I designed:**
- Two screens: landing page and drum kit, prototyped with Smart Animate transitions
- Each drum pad as a reusable `DrumPad` component with hover and pressed states
- The vintage color palette (`#120808` crimson · `#e8350a` red · `#e8d5a0` cream · `#c8a830` gold) locked in Figma first, then translated directly into CSS custom properties

**Why this mattered:** Designing in Figma first meant pad sizes, glow radii, layout spacing, and animation feel were all decided visually — not guessed in code. The Smart Animate prototype served as a precise spec for the 80ms scale + opacity + box-shadow `pressed` burst in CSS.

---

## Technical highlights

### Web Audio API — not `<audio>` tags
```js
async function loadAllSounds() {
  const ctx = getAudioCtx();
  await Promise.all(Object.entries(soundMap).map(async ([key, path]) => {
    const res = await fetch(path);
    buffers[key] = await ctx.decodeAudioData(await res.arrayBuffer());
  }));
}

function playSound(key) {
  const src = ctx.createBufferSource();
  src.buffer = buffers[key];
  src.connect(ctx.destination);
  src.start(0);
}
```
Sounds are fetched once, decoded into `AudioBuffer` objects, and replayed by creating a new `BufferSource` each time. This gives near-zero latency on every hit — `<audio>` tags have a ~100ms delay that makes them feel broken for instruments.

### CSS custom properties for per-pad theming
```css
:root {
  --tom1-accent:  #e8350a;
  --tom2-accent:  #c45ae8;
  --tom3-accent:  #5ae870;
  --snare-accent: #e87040;
  --crash-accent: #40e8d0;
  --kick-accent:  #408ae8;
}

.tom1.pressed { box-shadow: 0 0 28px 6px var(--tom1-accent); }
```
One source of truth per pad. Changing a color in `:root` updates the pad background tint, the glow, and the waveform bar color simultaneously.

### `clip-path` parallelogram button
```css
#cta-btn {
  clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
}
```
No images, no borders — the skewed button shape is pure CSS geometry.

### Waveform bars with CSS `@keyframes` and a custom property
```css
@keyframes wavePop {
  0%   { height: 0;        opacity: 0.9; }
  35%  { height: var(--h); }
  100% { height: 2px;      opacity: 0;  }
}
```
Each bar gets a random `--h` value set in JS at hit time. The same animation drives every bar, but they all peak at different heights because `--h` is set per element.

### Vinyl transition — pure CSS animation triggered by JS class toggle
```css
.big-vinyl {
  animation: spinIn 1.4s cubic-bezier(0.17, 0.67, 0.35, 1.2) forwards;
}

@keyframes spinIn {
  0%   { transform: scale(0) rotate(-200deg); opacity: 0; }
  60%  { opacity: 1; }
  100% { transform: scale(1.15) rotate(25deg); opacity: 0; }
}
```
The vinyl spins in from nothing, overshoots, and fades out — all in CSS. JS only adds and removes the `.active` class and handles the timing to swap pages underneath.

---

## Project structure

```
rock-and-roll-drum-kit/
├── index.html        ← landing page + drum kit markup
├── style.css         ← all styles (vintage palette, animations, image backgrounds)
├── index.js          ← Web Audio API, pad logic, vinyl transition
└── sounds/
    ├── tom-1.mp3
    ├── tom-2.mp3
    ├── tom-3.mp3
    ├── tom-4.mp3
    ├── snare.mp3
    ├── crash.mp3
    └── kick-bass.mp3
```

---

## Running locally

```bash
git clone https://github.com/MeghaMuskan/rock-and-roll-drum-kit.git
cd rock-and-roll-drum-kit
npx serve .
```

> Audio requires a server context (browser blocks `fetch()` on `file://`). Use `npx serve .` or VS Code Live Server.

## Deploying to GitHub Pages

1. Push to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from branch → main → / (root)**
4. Live at `https://MeghaMuskan.github.io/rock-and-roll-drum-kit`

---

## Why this is relevant for Juspay

Juspay's frontend stack (Presto, PureScript) values developers who understand the browser's native APIs deeply — not just framework abstractions. This project demonstrates:

- **DOM manipulation without a framework** — every element is created, styled, and animated with vanilla JS and CSS
- **Async data flow** — `Promise.all` for parallel audio decoding, `async/await` throughout
- **Performance thinking** — buffer caching over re-fetching, `requestAnimationFrame`-aware animation design, `touchstart` with `passive: false` for zero-delay mobile response
- **Component thinking without React** — CSS custom properties act as a design token system; each pad's behavior is driven by a single `data-key` attribute
- **UI/UX ownership end-to-end** — from Figma wireframe to deployed product, with no hand-off gap

---

Made with ❤️ in India &nbsp;★&nbsp; Keep It Classic

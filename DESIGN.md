# HBD App — Design Document

A mobile-first single-page birthday greeting for **GeoGirl**, built with React + Vite + Tailwind + GSAP. Continuous vertical scroll, "Clean Chaos" aesthetic.

---

## 1. Updated Section Flow

The original 4 sections expand to **6** to accommodate the new ideas:

| # | Section | Purpose | Status |
|---|---------|---------|--------|
| 1 | **The Trap** | Landing alert + "Accept Fate" CTA | existing |
| 2 | **The Gate** *(NEW)* | Riddle + password unlock | new |
| 3 | **Memory Lane** | 3 polaroids + parallax bg + scratch reveal | enhanced |
| 4 | **The Climax** | "HAPPY BIRTHDAY" + 4 chaotic GIFs | existing |
| 5 | **The Biryani Negotiation** *(NEW)* | Yes/No interactive ask | new |
| 6 | **Footer** | Faint legal-style text | existing |

Sections 3–5 remain **locked / blurred** until the gate password is entered correctly.

---

## 2. Idea 1: The Gate (Password + Riddle + Hint)

### Behavior
- Themed continuation of Section 1: heading reads **"ACCESS DENIED. Enter Key Phrase."**
- A short riddle is displayed; its answer is **"Sheep"** (case-insensitive, trimmed).
- Below the riddle: text input + **UNLOCK** button.
- Tappable **"Need a hint?"** link reveals the line:
  > *"First word of the latest movie she watched."*
- Wrong input → shake animation + small `Access denied. Try again.` message.
- Correct input → smooth scroll to Section 3, and Sections 3–5 fade in (until then they are blurred + non-interactive behind the gate).

### Proposed Riddle Text
> *"I follow the leader without a question,
> Wear a cloud, give wool on suggestion.
> I'm what insomniacs reach for in vain —
> Name me, and unlock this domain."*

(Easy to swap — single string constant in `App.jsx`.)

### State (React)
```jsx
const [unlocked, setUnlocked] = useState(false);
const [guess, setGuess] = useState("");
const [showHint, setShowHint] = useState(false);
const [shake, setShake] = useState(false);
```

### Locking the rest
While `!unlocked`, sections 3–5 get `pointer-events-none blur-md opacity-30 select-none` and the page is `overflow-hidden` so the user cannot scroll past the gate. On unlock, remove those classes and run `section3Ref.current.scrollIntoView({ behavior: "smooth" })`.

---

## 3. Idea 2: Parallax Background (Memory Lane)

### Behavior
A single faded background photo sits behind the Memory Lane polaroids and scrolls at **~40% of normal scroll speed**, creating depth.

### Implementation
- Absolutely positioned `<div>` with `background-image: url(/bg/parallax.jpg)` inside Section 3, `opacity: 0.15`, `scale: 1.1`, `object-fit: cover`.
- GSAP `ScrollTrigger` with `scrub: true`:
  ```js
  gsap.to(bgRef.current, {
    yPercent: -30,
    ease: "none",
    scrollTrigger: {
      trigger: section3Ref.current,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
  ```
- Falls back gracefully (just shows static if JS off).

### Asset
- **File:** `public/bg/parallax.jpg` (any wide candid shot — landscape orientation, ~1600×2400px works best).

---

## 4. Idea 3: Scratch-to-Reveal (Exhibit C)

### Behavior
The third polaroid ("Somehow, we survived…") starts as a **gray scratch card**. The user drags their finger / mouse over it to scratch away a noise overlay, revealing the real photo underneath.

### Implementation
- HTML5 `<canvas>` layered above an `<img>` inside the polaroid frame.
- On mount, fill canvas with a textured gray (or `#a0a0a0` solid).
- Pointer events (`onPointerDown`, `onPointerMove`):
  ```js
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.fill();
  ```
- After ~30% of canvas is cleared (sample every N pixels), auto-clear the rest and animate the caption in.
- Hint text below polaroid: *"👆 Scratch to reveal."*

### Caveats
- Must use `touch-action: none` on the canvas for mobile.
- Canvas size must match the rendered image — use `useResizeObserver` or recompute on window resize.

### Asset
- **File:** `public/photos/exhibit-3.jpg` — the photo that gets revealed.

---

## 5. Idea 4: The Biryani Negotiation (Yes/No Game)

### Behavior
Replaces the static "₹200 biryani" line. Becomes its own full-height section with a question and two buttons. The **No** button progressively shrinks while **Yes** grows, until No disappears entirely. Eventually you have no choice but to say yes — that's the joke.

### State Machine

| State | Prompt | Yes button | No button |
|-------|--------|------------|-----------|
| `idle` | "Will you send ₹200/- for biryani party??" | normal size | normal size |
| `denied-once` | "Bro please send me the biryani 😢" | scale 1.25, glow | scale 0.75 |
| `denied-twice` | "Fine. I'll just eat plain rice. Alone. 💀" | scale 1.6, pulsing | **hidden** |
| `accepted` | "🎉 YOU'RE THE BEST. Biryani party CONFIRMED. Venmo / GPay incoming." | (replaces buttons) | — |

### React State
```jsx
const [biryaniState, setBiryaniState] = useState("idle");
// transitions:
// idle  --No-->  denied-once
// idle  --Yes--> accepted
// denied-once --No-->  denied-twice
// denied-once --Yes--> accepted
// denied-twice --Yes--> accepted
```

### Animation
- Transition button scale via `transition-transform duration-300 ease-out`.
- In `denied-twice`, add `animate-pulse` to Yes.
- On `accepted`, optionally trigger a GSAP confetti burst (later, optional).

### Touch targets
Yes/No buttons start at **64×140px** so even when No shrinks to 0.75 it stays above 44×44.

---

## 6. Folder Structure (after cleanup)

```
HBD/
├── DESIGN.md                  ← this file
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── eslint.config.js
├── public/                    ← all swappable assets live here
│   ├── photos/
│   │   ├── exhibit-1.jpg     ← Memory Lane: questionable fashion
│   │   ├── exhibit-2.jpg     ← Memory Lane: co-conspirators
│   │   └── exhibit-3.jpg     ← Memory Lane: scratch-reveal photo
│   ├── gifs/
│   │   ├── gif-1.gif         ← Climax: top-left corner
│   │   ├── gif-2.gif         ← Climax: top-right corner
│   │   ├── gif-3.gif         ← Climax: bottom-left corner
│   │   └── gif-4.gif         ← Climax: bottom-right corner
│   └── bg/
│       └── parallax.jpg      ← Memory Lane parallax background
└── src/
    ├── App.jsx               ← all logic + JSX (will grow with new ideas)
    ├── main.jsx
    └── index.css             ← Tailwind directives + base resets
```

### Files removed (cleanup done)
- `src/App.css` — unused
- `src/assets/hero.png`, `react.svg`, `vite.svg` — Vite scaffold artifacts
- `public/favicon.svg`, `public/icons.svg` — Vite branded defaults
- (Removed favicon `<link>` from `index.html` — add your own later if desired.)

### Recommended file sizes
- **Photos**: 800×800px JPG, ≤ 200 KB each
- **GIFs**: 200×200px, ≤ 500 KB each (keep them snappy)
- **Parallax bg**: 1600×2400px JPG, ≤ 400 KB

---

## 7. Where to Put Your Images & GIFs

Drop your files into the matching folder — **no code changes needed** if you use the exact filenames below:

| What you have | Drop it here | Referenced in code as |
|---|---|---|
| Photo 1 (fashion) | `public/photos/exhibit-1.jpg` | `/photos/exhibit-1.jpg` |
| Photo 2 (friends) | `public/photos/exhibit-2.jpg` | `/photos/exhibit-2.jpg` |
| Photo 3 (scratch reveal) | `public/photos/exhibit-3.jpg` | `/photos/exhibit-3.jpg` |
| GIF 1 | `public/gifs/gif-1.gif` | `/gifs/gif-1.gif` |
| GIF 2 | `public/gifs/gif-2.gif` | `/gifs/gif-2.gif` |
| GIF 3 | `public/gifs/gif-3.gif` | `/gifs/gif-3.gif` |
| GIF 4 | `public/gifs/gif-4.gif` | `/gifs/gif-4.gif` |
| Parallax background | `public/bg/parallax.jpg` | `/bg/parallax.jpg` |

Anything in `public/` is served at the root URL — `public/photos/x.jpg` is reachable at `/photos/x.jpg` from the browser. **No `import` statements needed**, no rebuild required for swaps in dev mode.

---

## 8. Implementation Order (recommended)

1. **Cleanup** ✅ (done)
2. **Asset folder scaffolding** ✅ (done)
3. **Idea 1 — The Gate** (biggest flow change, blocks everything else visually)
4. **Idea 4 — Biryani Negotiation** (second biggest UX change, isolated component)
5. **Idea 2 — Parallax** (visual polish, small risk)
6. **Idea 3 — Scratch reveal** (most complex, canvas-based)

Each step can ship independently and be tested in isolation.

---

## 9. Decisions

- **Unlock is session-only.** No `localStorage` / `sessionStorage` — reload re-locks the gate. (per user 2026-05-21)
- Hint text fixed as: *"First word of the latest movie she watched."*
- Sections 3–5 + Footer are **conditionally rendered** (not blurred) — they don't exist in the DOM until the gate is unlocked. This avoids fighting body scroll and keeps the page short for the locked state.

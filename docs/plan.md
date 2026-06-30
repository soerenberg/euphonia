# Euphonia — Execution Plan

## 0. Name & visual identity

**Name: Euphonia** — a real word meaning "pleasantness of speech sound," one letter-shuffle from "euphoria." In-app boot/system text can use a more technical alter-ego (`VOX.SYS`) for flavor in calibration/boot-style moments, while "Euphonia" remains the actual app/brand name.

**Direction: BIOS-inspired, not a literal recreation.** Retro system-menu chrome (monospace labels, hard edges, bracketed tab strip, function-key footer bar) layered over a fully accessible, touch-friendly, mobile-first UI underneath. Confirmed via mockup.

**Palette** (pine background, rose as accent only, amber for out-of-range/warning):

| Token | Hex | Use |
|---|---|---|
| `--pine-bg` | `#16241C` | App background |
| `--bone-text` | `#EDE6DA` | Primary text |
| `--rose-accent` | `#C97B84` | Active tab, pitch trace line, key accents only — not body text |
| `--sage-muted` | `#7A8C7E` | Secondary text, borders, inactive tabs |
| `--amber-warn` | `#E8A33D` | Target-range band, out-of-range state |

**Typography:** monospace for chrome/labels/stats (system-readout feel), regular sans for prompt text and longer-form content (Free Talk prompts, calibration instructions) so nothing readability-critical is sacrificed to the theme.

**Signature element:** the pitch trace renders as a **stepped/blocky line** (oscilloscope-style), not a smooth curve — ties the visual theme to the actual function of the graph rather than being decoration on top of it. Reused everywhere pitch is plotted: main tab, floating widget (simplified), Compare overlay.

**Recurring chrome:**
- Bracketed tab strip: `[ PITCH ]  TALK  COMPARE`, active tab filled in rose.
- Function-key footer bar (`[F1] MENU  [F2] CALIBRATE  [F10] SAVE`), context-sensitive actions per tab.
- Target range shown as a translucent amber band behind the trace, not just a number.

**Accessibility guardrails on top of the theme:** rose/amber used as accents and large elements only, never as small body text on pine (contrast); real font sizes underneath the monospace styling, not pixel-font replicas; color-blind-safe in/out-of-range cues (the amber band plus position, not color alone).

## 1. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | React + TypeScript via **Vite** | Fast dev server, trivial static build for GH Pages |
| Hosting | GitHub Pages, deployed via GitHub Actions | Free, matches "static only" constraint |
| Pitch detection | **pitchy** (McLeod Pitch Method) | Lightweight, pure JS, no ML model, accurate for speaking pitch, gives a clarity/confidence score we need for filtering bad frames |
| Audio pipeline | **Web Audio API + AudioWorklet** | Keeps pitch analysis off the main thread so the UI doesn't stutter; required for smooth 30-60fps graph updates |
| Local persistence (settings) | `localStorage` | Simple, synchronous, fine for small JSON blobs (target range, selected categories, UI prefs) |
| Local persistence (audio clips) | `IndexedDB` via the `idb` package | Audio blobs are too large/async-heavy for localStorage |
| Real-time graph rendering | Raw `<canvas>` | React re-rendering a chart library at 30-60fps will jank, especially on mobile; canvas drawing imperatively avoids that |
| PWA / offline | `vite-plugin-pwa` | Installable, works after first load — nice fit for a static, privacy-first app |
| State management | React Context + hooks | App is small enough that Zustand/Redux would be overkill; revisit only if state sharing gets painful |
| Content data | Plain `.ts`/`.json` files under `/src/data` | Hand-editable now, structured for user-extensibility later |

No routing library needed — tabs can be plain state, no URL routing requirement was mentioned.

## 2. Project structure

```
/src
  main.tsx
  App.tsx                     # tab shell + hamburger menu
  /styles
    tokens.css                # pine/rose/amber/sage/bone CSS variables, font stacks
  /audio
    pitchWorklet.ts           # AudioWorklet processor (runs in separate thread)
    usePitchStream.ts         # hook: mic access -> worklet -> pitch+clarity stream
    pitchStats.ts             # percentile calc, in-range %, session avg, etc.
  /components
    SteppedPitchGraph.tsx     # canvas/SVG stepped graph, reused by tab 1, floating widget, Compare overlay
    FloatingPitchWidget.tsx
    BracketTabs.tsx           # [ PITCH ] TALK COMPARE strip
    FunctionKeyFooter.tsx     # [F1] MENU  [F2] CALIBRATE  [F10] SAVE, context-sensitive per tab
    HamburgerMenu.tsx
    TargetRangeSettings.tsx
    CalibrationFlow.tsx
  /tabs
    PitchMainTab.tsx
    FreeTalkTab.tsx
    CompareTab.tsx
  /data
    questions.smalltalk.ts
    questions.deeptalk.ts
    questions.weirdtalk.ts
    emojis.story.ts            # subject/location/action/object pools
  /store
    SettingsContext.tsx        # target range, time window, theme, etc.
  /storage
    localSettings.ts
    clipsDb.ts                 # IndexedDB wrapper for recorded clips
  /utils
    audioGesture.ts            # iOS Safari user-gesture unlock helper
    audioExport.ts             # encode recorded clip to WAV / WebM for download
```

## 3. Data file format (questions & emojis)

Designed to be hand-edited now, and ready for a "user adds their own" feature later without restructuring.

```ts
// data/questions.deeptalk.ts
export const deepTalkPrompts: Prompt[] = [
  { id: "dt-001", text: "What's a song that makes you cry, and why?" },
  { id: "dt-002", text: "Tell me about a dream you've had since childhood." },
  // ...
];
```

```ts
// data/emojis.story.ts
export const storyEmojiPools = {
  subjects: ["🧑‍🚀", "🐙", "🤖", "🧙‍♀️", /* ... */],
  locations: ["🏝️", "🌌", "🏰", "🚇", /* ... */],
  actions: ["🏃", "🍳", "🕺", "🔍", /* ... */],
  objects: ["🎻", "🗝️", "🍕", "📦", /* ... */],
};
```

Stable `id` fields matter even before user-extensibility, since they let us avoid showing the same prompt twice in a row and (later) let users mark favorites/skips by id rather than by text.

## 4. Phased roadmap

**Phase 0 — Scaffolding & deploy pipeline**
Spin up Vite+React+TS, get a "hello world" deployed to GitHub Pages via Actions before writing any real features. Proves the hosting path works and avoids a deployment surprise at the end.

**Phase 1 — Core audio engine (highest technical risk, build first)**
A bare-bones test page: mic permission button → AudioWorklet → pitchy → display raw number. Test specifically on **real iOS Safari** here, not just desktop Chrome — confirm:
- AudioContext starts correctly from a tap (not on load)
- AudioWorklet module loads correctly under Vite's bundling (worklets run in an isolated scope; needs the `new URL(..., import.meta.url)` pattern rather than a normal import)
- Pitch values look sane against a known reference (hum a note, check against a tuner)

Everything downstream depends on this working reliably, so it's worth de-risking before any UI investment.

**Phase 2 — Design system & visual identity**
Build the pine/rose/amber/sage/bone token set, font stacks, and the recurring chrome components (`BracketTabs`, `FunctionKeyFooter`, base bordered-box primitives) against the confirmed mockup direction, before building real tabs on top of them — keeps the theme consistent by construction rather than retrofitted later.

**Phase 3 — Pitch Main tab**
`SteppedPitchGraph` (stepped/blocky trace, not a smooth curve), adjustable time window (hamburger menu options), session stats readout (current/avg/% in range), graceful handling of silence (gap in line, not a drop to zero), amber target-range band.

**Phase 4 — Settings & target range**
Hamburger menu: manual Hz bounds entry, plus the two-mode calibration flow (baseline vs. target) we discussed — including clarity-filtered, percentile-based range calculation and a "review before committing" step.

**Phase 5 — Free Talk tab**
Category dropdown, prompt data files, "Next" button with no-immediate-repeat logic, emoji story generator, toggleable floating pitch widget (off by default or on — your call, but must be one-tap to hide).

**Phase 6 — Compare tab**
Sequential recording (IndexedDB), overlay multi-clip graph, per-clip stats table, clip labeling, per-clip delete + "delete all," storage-used indicator. Each clip row gets **play and download buttons side by side** — download exports as **WAV** (zero-dependency, universal) with **WebM/Opus** as a smaller-file option (native via `MediaRecorder`, supported on iOS Safari 14.5+). No MP4 — proper AAC encoding isn't realistically available client-side.

**Phase 7 — Polish**
PWA manifest/offline support, accessibility pass (color-blind-safe in-range/out-of-range indication, font sizing), calibration UX refinement based on real use.

**Phase 8 — Stretch / v2 ideas**
User-extendable prompt banks (add/edit via local storage), the experimental "same-session brightness trend" indicator (clearly caveated, not labeled resonance), multi-language prompt sets.

## 5. Suggested order of work

1. Phase 0 + Phase 1 together first — nothing else matters if mic + pitch detection isn't solid on iOS Safari.
2. Phase 2 next, so every tab is built on the real chrome/tokens from day one instead of getting re-skinned later.
3. Phase 3 next — simplest full vertical slice (mic → graph → done) and validates the canvas/SVG rendering approach.
4. Phase 4 before Phase 5/6, since Free Talk's floating widget and Compare's overlay both depend on a shared target-range concept already existing.
5. Phase 5 and 6 can be built in either order or in parallel once 1-4 are solid — they don't depend on each other.
6. Phase 7 throughout, as time allows, rather than strictly last.

---

Ready to start on Phase 0/1 whenever you are — I can scaffold the project structure and a working mic→pitch test harness as a first concrete step.

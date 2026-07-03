// Procedural dream-art generator.
//
// Turns a dream's detected emotions + symbols into a unique layered SVG
// scene (deterministic per seed, so "regenerate" with a new seed gives a
// fresh interpretation while history stays reproducible). This is the
// built-in visualization provider — no external image API required; the
// provider interface stays replaceable per docs/09.

import { seededRandom } from "@/lib/utils";

interface Palette {
  sky: [string, string, string];
  glow: string;
  land: string[];
  accent: string;
  star: string;
}

const PALETTES: Record<string, Palette> = {
  Joy:        { sky: ["#ffd9a0", "#ffab76", "#ff7e8a"], glow: "#fff3c4", land: ["#c96f6f", "#a25577", "#6e3f66"], accent: "#ffe9b8", star: "#ffffff" },
  Calm:       { sky: ["#bfe3ff", "#8fbfe8", "#6d8fd4"], glow: "#eaf7ff", land: ["#5f7fae", "#48618f", "#324268"], accent: "#dff1ff", star: "#ffffff" },
  Excitement: { sky: ["#ff9de2", "#b465f0", "#5f43d6"], glow: "#ffd3f4", land: ["#7a3fa8", "#572d86", "#341c5e"], accent: "#ffc4ef", star: "#fff0fa" },
  Curiosity:  { sky: ["#9be8d8", "#5fb9c9", "#4a6fb8"], glow: "#e2fff6", land: ["#3f7d8a", "#2f5a74", "#22395c"], accent: "#c9fff0", star: "#ffffff" },
  Love:       { sky: ["#ffc4c4", "#ff8fa3", "#c65b8a"], glow: "#fff0ef", land: ["#a34a6e", "#7c3457", "#4e2140"], accent: "#ffdce4", star: "#fff6f6" },
  Fear:       { sky: ["#3a3153", "#241f3d", "#12101f"], glow: "#8a7fb8", land: ["#221d38", "#171429", "#0b0a15"], accent: "#6f63a8", star: "#cfc8ff" },
  Anxiety:    { sky: ["#e8a87c", "#b96a55", "#5f3a4a"], glow: "#ffd9b0", land: ["#6e4049", "#4c2c3c", "#2c1a28"], accent: "#f4c398", star: "#ffe9d6" },
  Sadness:    { sky: ["#aebcd0", "#7c8ba8", "#4c5876"], glow: "#dfe7f2", land: ["#55617e", "#3d4761", "#272e44"], accent: "#c3cfe2", star: "#eef3fa" },
  Anger:      { sky: ["#f27059", "#b83843", "#571f33"], glow: "#ffb08c", land: ["#6b2436", "#471726", "#250b16"], accent: "#ff9a76", star: "#ffd6c4" },
  Confusion:  { sky: ["#c9a8e8", "#8f76c9", "#5648a0"], glow: "#eadfff", land: ["#5f4a8f", "#443569", "#2a2145"], accent: "#d9c6ff", star: "#f4edff" },
};

const W = 1024;
const H = 768;

export function generateDreamArt(opts: {
  dominantEmotion: string;
  symbols: string[];
  seed: number;
}): { svg: string; prompt: string } {
  const palette = PALETTES[opts.dominantEmotion] ?? PALETTES.Curiosity;
  const rnd = seededRandom(opts.seed);
  const symbols = new Set(opts.symbols);
  const layers: string[] = [];

  // ── Sky ──────────────────────────────────────────────────────────────
  layers.push(`
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette.sky[0]}"/>
      <stop offset="55%" stop-color="${palette.sky[1]}"/>
      <stop offset="100%" stop-color="${palette.sky[2]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.95"/>
      <stop offset="60%" stop-color="${palette.glow}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${palette.glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="2.2"/></filter>
    <filter id="dream" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="${opts.seed % 100}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="14"/>
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${(opts.seed * 7) % 100}"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer>
      <feComposite operator="over" in2="SourceGraphic"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>`);

  // ── Stars ────────────────────────────────────────────────────────────
  const starCount = symbols.has("Stars") ? 150 : symbols.has("Darkness") || opts.dominantEmotion === "Fear" ? 110 : 70;
  const stars: string[] = [];
  for (let i = 0; i < starCount; i++) {
    const x = rnd() * W;
    const y = rnd() * H * 0.62;
    const r = rnd() * 1.7 + 0.4;
    const o = (rnd() * 0.55 + 0.25).toFixed(2);
    stars.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${palette.star}" opacity="${o}"/>`);
  }
  layers.push(`<g>${stars.join("")}</g>`);

  // ── Celestial body: moon (default) or sun for warm emotions ─────────
  const cx = W * (0.2 + rnd() * 0.6);
  const cy = H * (0.14 + rnd() * 0.18);
  const warm = ["Joy", "Love", "Excitement"].includes(opts.dominantEmotion);
  const bodyR = 46 + rnd() * 26;
  layers.push(`<circle cx="${cx}" cy="${cy}" r="${bodyR * 3.2}" fill="url(#glow)"/>`);
  if (warm && !symbols.has("Moon")) {
    layers.push(`<circle cx="${cx}" cy="${cy}" r="${bodyR}" fill="${palette.glow}"/>`);
  } else {
    // crescent moon
    layers.push(`<g filter="url(#soft)">
      <circle cx="${cx}" cy="${cy}" r="${bodyR}" fill="${palette.glow}"/>
      <circle cx="${cx + bodyR * 0.42}" cy="${cy - bodyR * 0.18}" r="${bodyR * 0.86}" fill="${palette.sky[0]}" opacity="0.9"/>
    </g>`);
  }

  // ── Clouds (drifting blobs) ──────────────────────────────────────────
  const cloudCount = symbols.has("Sky") ? 6 : 3;
  for (let i = 0; i < cloudCount; i++) {
    const x = rnd() * W;
    const y = H * (0.1 + rnd() * 0.35);
    const w = 120 + rnd() * 180;
    layers.push(`<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${w.toFixed(0)}" ry="${(w * 0.22).toFixed(0)}" fill="${palette.glow}" opacity="0.14" filter="url(#soft)"/>`);
  }

  // ── Storm ────────────────────────────────────────────────────────────
  if (symbols.has("Storm")) {
    const lx = W * (0.25 + rnd() * 0.5);
    let ly = H * 0.1;
    let path = `M ${lx} ${ly}`;
    let px = lx;
    for (let i = 0; i < 5; i++) {
      px += (rnd() - 0.5) * 90;
      ly += H * 0.08 + rnd() * 40;
      path += ` L ${px.toFixed(0)} ${ly.toFixed(0)}`;
    }
    layers.push(`<path d="${path}" stroke="${palette.accent}" stroke-width="4" fill="none" opacity="0.85" filter="url(#soft)"/>`);
    const rain: string[] = [];
    for (let i = 0; i < 60; i++) {
      const x = rnd() * W, y = rnd() * H * 0.7;
      rain.push(`<line x1="${x}" y1="${y}" x2="${x - 6}" y2="${y + 18}" stroke="${palette.star}" stroke-width="1" opacity="0.25"/>`);
    }
    layers.push(`<g>${rain.join("")}</g>`);
  }

  // ── Birds / flying ───────────────────────────────────────────────────
  if (symbols.has("Flying") || symbols.has("Flying Vehicle") || symbols.has("Flying Insects")) {
    const birds: string[] = [];
    const n = 5 + Math.floor(rnd() * 5);
    for (let i = 0; i < n; i++) {
      const x = W * (0.1 + rnd() * 0.8);
      const y = H * (0.12 + rnd() * 0.3);
      const s = 8 + rnd() * 14;
      birds.push(`<path d="M ${x - s} ${y} Q ${x - s / 2} ${y - s * 0.8} ${x} ${y} Q ${x + s / 2} ${y - s * 0.8} ${x + s} ${y}" stroke="${palette.land[2]}" stroke-width="2.4" fill="none" opacity="0.75"/>`);
    }
    layers.push(`<g>${birds.join("")}</g>`);
  }

  // ── Middle scenery, chosen by symbols ───────────────────────────────
  const horizon = H * 0.62;

  function mountainPath(baseY: number, amp: number, roughness: number): string {
    let d = `M 0 ${H} L 0 ${baseY}`;
    const steps = 8 + Math.floor(rnd() * 5);
    for (let i = 1; i <= steps; i++) {
      const x = (W / steps) * i;
      const y = baseY - rnd() * amp + (rnd() - 0.5) * roughness;
      d += ` L ${x.toFixed(0)} ${y.toFixed(0)}`;
    }
    d += ` L ${W} ${H} Z`;
    return d;
  }

  const hasMountain = symbols.has("Mountain");
  const hasForest = symbols.has("Forest");
  const hasWater = symbols.has("Water") || symbols.has("Ocean");
  const hasHouse = symbols.has("House");
  const hasBridge = symbols.has("Bridge");
  const hasDoor = symbols.has("Door");
  const hasFire = symbols.has("Fire");
  const hasSnake = symbols.has("Snake");

  // Distant ridges (always present — dreamscape base)
  layers.push(`<path d="${mountainPath(horizon - (hasMountain ? 150 : 60), hasMountain ? 190 : 80, 40)}" fill="${palette.land[0]}" opacity="0.75" filter="url(#dream)"/>`);
  layers.push(`<path d="${mountainPath(horizon - 20, hasMountain ? 130 : 60, 30)}" fill="${palette.land[1]}" opacity="0.9" filter="url(#dream)"/>`);

  // Forest silhouettes
  if (hasForest) {
    const trees: string[] = [];
    const n = 26;
    for (let i = 0; i < n; i++) {
      const x = (W / n) * i + rnd() * 26;
      const th = 60 + rnd() * 110;
      const ty = horizon + 30 - th;
      const tw = th * 0.36;
      trees.push(`<path d="M ${x} ${ty + th} L ${x} ${ty + th * 0.55}" stroke="${palette.land[2]}" stroke-width="4"/>
        <path d="M ${x - tw} ${ty + th * 0.72} L ${x} ${ty} L ${x + tw} ${ty + th * 0.72} Z" fill="${palette.land[2]}"/>
        <path d="M ${x - tw * 0.8} ${ty + th * 0.5} L ${x} ${ty - th * 0.1} L ${x + tw * 0.8} ${ty + th * 0.5} Z" fill="${palette.land[2]}"/>`);
    }
    layers.push(`<g opacity="0.92">${trees.join("")}</g>`);
  }

  // Water: layered waves below horizon + reflection of glow
  if (hasWater) {
    const waveLayers: string[] = [];
    for (let l = 0; l < 4; l++) {
      const y0 = horizon + 30 + l * 40;
      let d = `M 0 ${H} L 0 ${y0}`;
      for (let x = 0; x <= W; x += 60) {
        const y = y0 + Math.sin((x / 120) + l * 2 + rnd() * 0.4) * 12;
        d += ` L ${x} ${y.toFixed(0)}`;
      }
      d += ` L ${W} ${H} Z`;
      waveLayers.push(`<path d="${d}" fill="${palette.land[Math.min(2, l)]}" opacity="${0.5 + l * 0.14}"/>`);
    }
    layers.push(`<g filter="url(#dream)">${waveLayers.join("")}</g>`);
    layers.push(`<ellipse cx="${cx}" cy="${horizon + 70}" rx="${bodyR * 1.6}" ry="14" fill="${palette.glow}" opacity="0.35" filter="url(#soft)"/>`);
  } else {
    // Ground
    layers.push(`<path d="${mountainPath(horizon + 60, 40, 20)}" fill="${palette.land[2]}" filter="url(#dream)"/>`);
  }

  // Winding path (snake or journey feel)
  if (hasSnake || symbols.has("Lost")) {
    const startX = W * (0.3 + rnd() * 0.4);
    let d = `M ${startX} ${H}`;
    let x = startX, y = H;
    for (let i = 0; i < 6; i++) {
      x += (rnd() - 0.5) * 220;
      y -= (H - horizon - 30) / 6;
      d += ` Q ${(x + (rnd() - 0.5) * 160).toFixed(0)} ${(y + 20).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)}`;
    }
    layers.push(`<path d="${d}" stroke="${palette.accent}" stroke-width="10" fill="none" opacity="0.35" stroke-linecap="round" filter="url(#soft)"/>`);
  }

  // House silhouette with a lit window
  if (hasHouse) {
    const hx = W * (0.55 + rnd() * 0.3);
    const hy = horizon + 26;
    layers.push(`<g filter="url(#soft)">
      <rect x="${hx - 46}" y="${hy - 52}" width="92" height="52" fill="${palette.land[2]}"/>
      <path d="M ${hx - 58} ${hy - 52} L ${hx} ${hy - 98} L ${hx + 58} ${hy - 52} Z" fill="${palette.land[2]}"/>
      <rect x="${hx - 12}" y="${hy - 34}" width="22" height="20" fill="${palette.glow}" opacity="0.9"/>
    </g>`);
  }

  // Bridge across the lower third
  if (hasBridge) {
    const by = horizon + 46;
    layers.push(`<g opacity="0.9" filter="url(#soft)">
      <path d="M ${W * 0.12} ${by} Q ${W / 2} ${by - 90} ${W * 0.88} ${by}" stroke="${palette.land[2]}" stroke-width="9" fill="none"/>
      <line x1="${W * 0.3}" y1="${by - 52}" x2="${W * 0.3}" y2="${by}" stroke="${palette.land[2]}" stroke-width="5"/>
      <line x1="${W * 0.7}" y1="${by - 52}" x2="${W * 0.7}" y2="${by}" stroke="${palette.land[2]}" stroke-width="5"/>
      <line x1="${W * 0.5}" y1="${by - 66}" x2="${W * 0.5}" y2="${by}" stroke="${palette.land[2]}" stroke-width="5"/>
    </g>`);
  }

  // Glowing door — threshold imagery
  if (hasDoor) {
    const dx = W * (0.4 + rnd() * 0.2);
    const dy = horizon + 44;
    layers.push(`<g>
      <rect x="${dx - 30}" y="${dy - 108}" width="60" height="108" rx="28" fill="${palette.glow}" opacity="0.95" filter="url(#soft)"/>
      <rect x="${dx - 40}" y="${dy - 118}" width="80" height="128" rx="34" fill="none" stroke="${palette.accent}" stroke-width="3" opacity="0.6"/>
    </g>`);
  }

  // Fire embers
  if (hasFire) {
    const embers: string[] = [];
    for (let i = 0; i < 40; i++) {
      const x = W * (0.2 + rnd() * 0.6);
      const y = horizon + 60 - rnd() * 260;
      embers.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(rnd() * 3 + 1).toFixed(1)}" fill="#ffb36b" opacity="${(rnd() * 0.6 + 0.2).toFixed(2)}"/>`);
    }
    layers.push(`<g filter="url(#soft)">${embers.join("")}</g>`);
  }

  // ── Floating dream orbs (always) ─────────────────────────────────────
  const orbs: string[] = [];
  for (let i = 0; i < 14; i++) {
    const x = rnd() * W;
    const y = H * 0.3 + rnd() * H * 0.55;
    const r = rnd() * 5 + 2;
    orbs.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${palette.accent}" opacity="${(rnd() * 0.4 + 0.15).toFixed(2)}"/>`);
  }
  layers.push(`<g filter="url(#soft)">${orbs.join("")}</g>`);

  // ── Vignette + grain ─────────────────────────────────────────────────
  layers.push(`<rect width="${W}" height="${H}" fill="url(#glow)" opacity="0.05"/>
  <rect width="${W}" height="${H}" fill="none"/>
  <radialGradient id="vig" cx="50%" cy="46%" r="75%">
    <stop offset="62%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity="0.32"/>
  </radialGradient>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.5"/>`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${layers.join("\n")}</svg>`;

  const prompt = `A dreamlike ${opts.dominantEmotion.toLowerCase()} landscape${
    opts.symbols.length ? ` featuring ${opts.symbols.slice(0, 4).join(", ").toLowerCase()}` : ""
  }, soft atmospheric light, layered silhouettes, floating particles — seed ${opts.seed}`;

  return { svg, prompt };
}

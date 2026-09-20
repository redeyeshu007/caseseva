import * as THREE from "three";

/**
 * Small canvas-generated textures for the Crossfire scene. Nothing is loaded
 * from disk: leather grain, gold-foil embossing, page edges, paper print,
 * wood and the Ashoka-chakra plaque are all drawn once, at low resolution.
 */

const GOLD = "#b8953a";

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function canvas(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  return c;
}

function texture(source, { srgb = true, repeat, wrap } = {}) {
  const t = new THREE.CanvasTexture(source);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 4;
  if (repeat || wrap) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (repeat) t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

/** Pebbled grain: small light/dark dots. mode: "color" | "bump" */
function grain(g, w, h, count, mode, seed = 7) {
  const r = rng(seed);
  for (let i = 0; i < count; i += 1) {
    const x = r() * w;
    const y = r() * h;
    const radius = 0.5 + r() * 1.4;
    const light = r() < 0.5;
    const a = mode === "bump" ? 0.14 + r() * 0.2 : 0.035 + r() * 0.07;
    g.fillStyle = light ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    g.beginPath();
    g.arc(x, y, radius, 0, Math.PI * 2);
    g.fill();
  }
}

/** Foil emboss: light edge up-left, dark edge down-right, gold in the middle. */
function emboss(g, mode, draw) {
  const passes =
    mode === "color"
      ? [
          [-1, -1, "rgba(255,238,170,0.4)"],
          [1, 1, "rgba(0,0,0,0.55)"],
          [0, 0, GOLD],
        ]
      : [[0, 0, mode === "orm" ? "rgb(0,92,255)" : "#ffffff"]]; // orm: G = roughness, B = metalness
  passes.forEach(([dx, dy, colour]) => {
    g.save();
    g.translate(dx, dy);
    g.strokeStyle = colour;
    g.fillStyle = colour;
    draw(g);
    g.restore();
  });
}

function paintCover(g, W, H, mode) {
  if (mode === "color") {
    g.fillStyle = "#161618";
    g.fillRect(0, 0, W, H);
    grain(g, W, H, 15000, "color");
  } else if (mode === "orm") {
    g.fillStyle = "rgb(0,196,0)";
    g.fillRect(0, 0, W, H);
  } else {
    g.fillStyle = "#808080";
    g.fillRect(0, 0, W, H);
    grain(g, W, H, 15000, "bump");
  }

  const cx = W / 2;

  emboss(g, mode, (c) => {
    // double border
    c.lineWidth = 3;
    c.strokeRect(28, 28, W - 56, H - 56);
    c.lineWidth = 1.2;
    c.strokeRect(40, 40, W - 80, H - 80);

    // corner quarter-arcs
    c.lineWidth = 1.5;
    [
      [52, 52, 0],
      [W - 52, 52, 0.5],
      [W - 52, H - 52, 1],
      [52, H - 52, 1.5],
    ].forEach(([x, y, q]) => {
      c.beginPath();
      c.arc(x, y, 22, q * Math.PI, (q + 0.5) * Math.PI);
      c.stroke();
    });

    // Ashoka chakra: rim, hub and 24 spokes
    const cy = H * 0.34;
    const R = 62;
    c.lineWidth = 3;
    c.beginPath();
    c.arc(cx, cy, R, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(cx, cy, R * 0.16, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 1.6;
    for (let i = 0; i < 24; i += 1) {
      const a = (i / 24) * Math.PI * 2;
      c.beginPath();
      c.moveTo(cx + Math.cos(a) * R * 0.18, cy + Math.sin(a) * R * 0.18);
      c.lineTo(cx + Math.cos(a) * (R - 3), cy + Math.sin(a) * (R - 3));
      c.stroke();
    }

    // title
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = '600 31px Inter, system-ui, sans-serif';
    if ("letterSpacing" in c) c.letterSpacing = "7px";
    c.fillText("THE CONSTITUTION", cx + 3, H * 0.62);
    c.fillText("OF INDIA", cx + 3, H * 0.62 + 46);
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(cx - 60, H * 0.62 + 84);
    c.lineTo(cx + 60, H * 0.62 + 84);
    c.stroke();
  });
}

/** Top cover: colour, roughness/metalness (G/B) and bump maps. */
function coverTextures() {
  const W = 512;
  const H = 725; // 0.24 × 0.34 m board
  const make = (mode) => canvas(W, H, (g) => paintCover(g, W, H, mode));
  return {
    map: texture(make("color")),
    orm: texture(make("orm"), { srgb: false }),
    bump: texture(make("bump"), { srgb: false }),
  };
}

/** Plain leather (spine, back, edges). */
function leatherTextures() {
  const size = 256;
  return {
    map: texture(
      canvas(size, size, (g) => {
        g.fillStyle = "#161618";
        g.fillRect(0, 0, size, size);
        grain(g, size, size, 7000, "color", 11);
      }),
      { repeat: [2, 2] }
    ),
    bump: texture(
      canvas(size, size, (g) => {
        g.fillStyle = "#808080";
        g.fillRect(0, 0, size, size);
        grain(g, size, size, 7000, "bump", 11);
      }),
      { srgb: false, repeat: [2, 2] }
    ),
  };
}

/** Fine horizontal page lines for the book's edges. */
function pageEdgeTexture() {
  return texture(
    canvas(8, 128, (g, w, h) => {
      g.fillStyle = "#efe7d4";
      g.fillRect(0, 0, w, h);
      const r = rng(3);
      for (let y = 0; y < h; y += 1) {
        g.fillStyle = y % 2 ? "rgba(120,100,70,0.16)" : `rgba(255,255,255,${0.1 + r() * 0.1})`;
        g.fillRect(0, y, w, 1);
      }
    }),
    { wrap: true }
  );
}

/**
 * The printed top sheet of a case file: header, body lines, a table block and a
 * side-specific mark. Bars stand in for text — no real content.
 */
function paperTexture(accent) {
  return texture(
    canvas(256, 362, (g, w, h) => {
      g.fillStyle = "#f4f1ea";
      g.fillRect(0, 0, w, h);
      const r = rng(accent === "brass" ? 21 : 42);

      g.fillStyle = "rgba(40,40,40,0.78)";
      g.fillRect(24, 26, 96, 6);
      g.fillStyle = "rgba(40,40,40,0.35)";
      g.fillRect(24, 40, 60, 3);
      g.fillStyle = "rgba(40,40,40,0.5)";
      g.fillRect(24, 56, w - 48, 1);

      for (let i = 0; i < 17; i += 1) {
        const y = 72 + i * 10.5;
        if (i === 7) continue;
        g.fillStyle = "rgba(50,50,50,0.5)";
        g.fillRect(24, y, (w - 48) * (i % 6 === 5 ? 0.55 : 0.82 + r() * 0.18), 2.6);
      }

      // table block
      g.strokeStyle = "rgba(50,50,50,0.35)";
      g.lineWidth = 1;
      g.strokeRect(24, 262, w - 48, 48);
      g.beginPath();
      g.moveTo(24, 286);
      g.lineTo(w - 24, 286);
      g.moveTo(w / 2, 262);
      g.lineTo(w / 2, 310);
      g.stroke();

      // side mark
      g.save();
      g.translate(w - 62, h - 34);
      if (accent === "brass") {
        g.strokeStyle = "rgba(184,149,58,0.85)";
        g.lineWidth = 2;
        g.beginPath();
        g.arc(0, 0, 20, 0, Math.PI * 2);
        g.stroke();
        g.beginPath();
        g.arc(0, 0, 13, 0, Math.PI * 2);
        g.stroke();
      } else {
        g.rotate(-0.1);
        g.strokeStyle = "rgba(122,46,46,0.85)";
        g.lineWidth = 2;
        g.strokeRect(-26, -14, 52, 28);
        g.fillStyle = "rgba(122,46,46,0.7)";
        g.fillRect(-18, -4, 36, 2.5);
        g.fillRect(-18, 3, 22, 2.5);
      }
      g.restore();
    })
  );
}

/** Light oak with faint grain, tiled. */
function woodTexture() {
  return texture(
    canvas(512, 512, (g, w, h) => {
      g.fillStyle = "#b39470";
      g.fillRect(0, 0, w, h);
      const r = rng(5);
      for (let i = 0; i < 260; i += 1) {
        const y = r() * h;
        const amp = 2 + r() * 6;
        const f = 0.004 + r() * 0.01;
        g.strokeStyle = r() < 0.5 ? "rgba(96,66,38,0.13)" : "rgba(255,240,215,0.1)";
        g.lineWidth = 0.6 + r() * 1.4;
        g.beginPath();
        for (let x = 0; x <= w; x += 8) g.lineTo(x, y + Math.sin(x * f + i) * amp);
        g.stroke();
      }
    }),
    { repeat: [2.2, 1.4], wrap: true }
  );
}

/** Radial fade so the desk dissolves into the white page. */
function fadeTexture() {
  return texture(
    canvas(128, 128, (g, w, h) => {
      const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.55, "#9a9a9a");
      grad.addColorStop(1, "#000000");
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
    }),
    { srgb: false }
  );
}

/** Ashoka chakra plaque for the courtroom wall — a quiet architectural detail. */
function chakraTexture() {
  return texture(
    canvas(256, 256, (g, w, h) => {
      g.fillStyle = "#d9cfba";
      g.beginPath();
      g.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#a89468";
      g.fillStyle = "#a89468";
      g.lineWidth = 5;
      g.beginPath();
      g.arc(w / 2, h / 2, w * 0.36, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.arc(w / 2, h / 2, w * 0.05, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 2.5;
      for (let i = 0; i < 24; i += 1) {
        const a = (i / 24) * Math.PI * 2;
        g.beginPath();
        g.moveTo(w / 2 + Math.cos(a) * w * 0.07, h / 2 + Math.sin(a) * w * 0.07);
        g.lineTo(w / 2 + Math.cos(a) * w * 0.34, h / 2 + Math.sin(a) * w * 0.34);
        g.stroke();
      }
    })
  );
}

/** Everything the foreground stage needs; call `dispose()` on unmount. */
export function makeStageAssets() {
  const cover = coverTextures();
  const leather = leatherTextures();
  const all = {
    coverMap: cover.map,
    coverOrm: cover.orm,
    coverBump: cover.bump,
    leatherMap: leather.map,
    leatherBump: leather.bump,
    pageEdge: pageEdgeTexture(),
    paperBrass: paperTexture("brass"),
    paperOx: paperTexture("oxblood"),
    wood: woodTexture(),
    fade: fadeTexture(),
  };
  return { ...all, dispose: () => Object.values(all).forEach((t) => t.dispose()) };
}

export function makeCourtroomAssets() {
  const all = { chakra: chakraTexture() };
  return { ...all, dispose: () => Object.values(all).forEach((t) => t.dispose()) };
}

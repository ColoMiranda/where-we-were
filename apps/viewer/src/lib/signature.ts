// Each project carries deterministic data-texture hashed from its id —
// identity is computed, never chosen. Stable everywhere it renders.

function hash32(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h || 1;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic on/off pixel grid for an id — the data-map material. */
export function pixelGrid(id: string, cols: number, rows: number): boolean[] {
  const rand = mulberry32(hash32(`${id}:map`));
  return Array.from({ length: cols * rows }, () => rand() > 0.55);
}

/** Deterministic binary digit rows for an id — the numeric-matrix material. */
export function numericMatrix(id: string, cols: number, rows: number): string[] {
  const rand = mulberry32(hash32(`${id}:matrix`));
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (rand() > 0.5 ? "1" : "0")).join("")
  );
}

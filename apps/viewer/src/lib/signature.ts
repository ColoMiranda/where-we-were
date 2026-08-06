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

export interface CellLife {
  anim: "dip" | "ghost";
  /** Cycle length in seconds. */
  period: number;
  /** Negative phase offset in seconds, so cells never blink in unison. */
  delay: number;
  /** Scan timing jitter in ms. */
  scanJitter: number;
  /** Scan flick length in ms. */
  scanDuration: number;
}

/**
 * Deterministic per-cell animation timings for a pixel grid. Seeded
 * separately from the grid so the signature itself never changes.
 */
export function signatureLife(id: string, cells: boolean[]): CellLife[] {
  const rand = mulberry32(hash32(`${id}:life`));
  return cells.map((on) => {
    const period = Math.round((7 + rand() * 6) * 100) / 100;
    const delay = Math.round(-rand() * period * 100) / 100;
    const scanJitter = Math.round(rand() * 36 - 18);
    const scanDuration = Math.round(100 + rand() * 120);
    return { anim: on ? "dip" : "ghost", period, delay, scanJitter, scanDuration };
  });
}

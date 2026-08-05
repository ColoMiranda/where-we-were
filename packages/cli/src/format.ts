import type { WwwTask } from "@www/shared";

/** NOW / {n}H / {n}D / {n}W — same buckets as the viewer's dataTime. */
export function relTime(iso: string, now = Date.now()): string {
  const ms = now - new Date(iso).getTime();
  const h = Math.floor(ms / 3_600_000);
  if (h < 1) return "NOW";
  if (h < 24) return `${h}H`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}D`;
  return `${Math.floor(d / 7)}W`;
}

function pad(s: string, w: number): string {
  return s.length >= w ? s : s + " ".repeat(w - s.length);
}

export function taskLine(t: WwwTask): string {
  return [
    pad(t.id.slice(0, 8), 10),
    pad(t.status, 24),
    pad(`P${t.priority}`, 4),
    pad(relTime(t.lastTouched), 5),
    t.title,
  ].join("");
}

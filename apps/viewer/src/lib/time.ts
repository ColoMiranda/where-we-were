/** Data-voice age: "NOW" · "3H" · "2D" · "5W" — timestamps stay last in the hierarchy. */
export function dataTime(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600_000);
  if (hours < 1) return "NOW";
  if (hours < 24) return `${hours}H`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}D`;
  return `${Math.floor(days / 7)}W`;
}

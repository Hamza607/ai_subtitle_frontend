/**
 * Format milliseconds to SRT format: HH:MM:SS,mmm
 */
export function formatSrtTime(ms: number): string {
  const safeMs = Math.max(0, Math.floor(ms || 0));
  const hours = Math.floor(safeMs / 3_600_000);
  const minutes = Math.floor((safeMs % 3_600_000) / 60_000);
  const seconds = Math.floor((safeMs % 60_000) / 1_000);
  const millis = safeMs % 1_000;

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const pad3 = (n: number) => String(n).padStart(3, '0');

  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)},${pad3(millis)}`;
}

/**
 * Format seconds to MM:SS or HH:MM:SS for video player display
 */
export function formatPlayerTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSec = Math.floor(seconds);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Parse an SRT timestamp string (HH:MM:SS,mmm or HH:MM:SS.mmm) to milliseconds
 */
export function parseSrtTime(timeString: string): number {
  if (!timeString) return 0;
  const normalized = timeString.trim().replace('.', ',');
  const parts = normalized.split(':');
  if (parts.length < 3) return 0;

  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const [secondsStr, millisStr] = parts[2].split(',');
  const seconds = parseInt(secondsStr, 10) || 0;
  const millis = parseInt(millisStr || '0', 10) || 0;

  return hours * 3_600_000 + minutes * 60_000 + seconds * 1_000 + millis;
}

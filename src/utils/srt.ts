import { SubtitleSegment, ValidationResult } from '../types/subtitle';
import { formatSrtTime } from './time';

/**
 * Serialize subtitle segments into UTF-8 SRT text
 */
export function toSrt(segments: SubtitleSegment[]): string {
  if (!segments || segments.length === 0) return '';

  return [...segments]
    .sort((a, b) => a.startMs - b.startMs)
    .map((segment, index) => {
      const startMs = Math.max(0, segment.startMs || 0);
      const endMs = Math.max(startMs + 500, segment.endMs || startMs + 1000);
      const text = (segment.translatedText || '').trim();

      return [
        String(index + 1),
        `${formatSrtTime(startMs)} --> ${formatSrtTime(endMs)}`,
        text || '...'
      ].join('\n');
    })
    .join('\n\n') + '\n';
}

/**
 * Validate subtitle segments and detect timing warnings
 */
export function validateSegments(segments: SubtitleSegment[]): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!Array.isArray(segments)) {
    return { valid: false, warnings, errors: ['Segments must be an array'] };
  }

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const index = i + 1;

    if (typeof seg.startMs !== 'number' || seg.startMs < 0) {
      errors.push(`Segment #${index} has invalid start time (${seg.startMs}ms).`);
    }

    if (typeof seg.endMs !== 'number' || seg.endMs <= seg.startMs) {
      errors.push(`Segment #${index} end time must be greater than start time.`);
    }

    const durationSec = (seg.endMs - seg.startMs) / 1000;
    const textLen = (seg.translatedText || '').length;

    // Check reading speed: typical reading speed is 20-25 chars per second
    if (durationSec > 0 && textLen / durationSec > 28) {
      warnings.push(`Segment #${index} duration may be too fast to read comfortably.`);
    }

    // Check overlap with next segment
    if (i < segments.length - 1) {
      const nextSeg = segments[i + 1];
      if (seg.endMs > nextSeg.startMs) {
        warnings.push(`Segment #${index} overlaps with Segment #${index + 1}.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Helper to download text content as a file with UTF-8 BOM
 */
export function downloadFile(content: string, fileName: string, mimeType: string = 'text/plain;charset=utf-8') {
  // Use UTF-8 BOM (\uFEFF) for optimal Urdu text rendering across all external video players
  const blob = new Blob(['\uFEFF', content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

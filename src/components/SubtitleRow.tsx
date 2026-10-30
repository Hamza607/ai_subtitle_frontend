import React, { useState } from 'react';
import { Play, Trash2, Split, CheckSquare, Square, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { SubtitleSegment } from '../types/subtitle';
import { formatSrtTime, parseSrtTime } from '../utils/time';

interface SubtitleRowProps {
  segment: SubtitleSegment;
  index: number;
  isActive: boolean;
  onUpdate: (updated: SubtitleSegment) => void;
  onDelete: (id: string) => void;
  onSplit: (id: string) => void;
  onJumpTo: (ms: number) => void;
  warning?: string;
  error?: string;
}

export const SubtitleRow: React.FC<SubtitleRowProps> = ({
  segment,
  index,
  isActive,
  onUpdate,
  onDelete,
  onSplit,
  onJumpTo,
  warning,
  error
}) => {
  const [showTurkish, setShowTurkish] = useState(true);
  const [startInput, setStartInput] = useState(formatSrtTime(segment.startMs));
  const [endInput, setEndInput] = useState(formatSrtTime(segment.endMs));

  const handleStartBlur = () => {
    const parsed = parseSrtTime(startInput);
    if (!isNaN(parsed) && parsed !== segment.startMs) {
      onUpdate({ ...segment, startMs: parsed });
    } else {
      setStartInput(formatSrtTime(segment.startMs));
    }
  };

  const handleEndBlur = () => {
    const parsed = parseSrtTime(endInput);
    if (!isNaN(parsed) && parsed !== segment.endMs) {
      onUpdate({ ...segment, endMs: parsed });
    } else {
      setEndInput(formatSrtTime(segment.endMs));
    }
  };

  const durationSec = ((segment.endMs - segment.startMs) / 1000).toFixed(1);

  return (
    <div
      style={{
        padding: '14px',
        borderRadius: '12px',
        background: isActive ? 'rgba(225, 29, 72, 0.12)' : 'rgba(255, 255, 255, 0.02)',
        border: isActive
          ? '1px solid var(--primary)'
          : error
          ? '1px solid rgba(239, 68, 68, 0.4)'
          : warning
          ? '1px solid rgba(245, 158, 11, 0.3)'
          : '1px solid var(--border-subtle)',
        marginBottom: '10px',
        transition: 'all 0.2s ease',
        boxShadow: isActive ? '0 0 15px rgba(225, 29, 72, 0.2)' : 'none'
      }}
    >
      {/* Top Bar: Index, Timing Inputs, Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Index Badge */}
          <span style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            {index + 1}
          </span>

          {/* Jump to start */}
          <button
            onClick={() => onJumpTo(segment.startMs)}
            className="btn-icon"
            style={{ width: '28px', height: '28px' }}
            title="Play this subtitle segment in video"
          >
            <Play size={13} />
          </button>

          {/* Start Time Input */}
          <input
            type="text"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            onBlur={handleStartBlur}
            style={{ width: '105px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '4px 6px', textAlign: 'center' }}
            title="Start Timestamp (HH:MM:SS,mmm)"
          />
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>➔</span>
          {/* End Time Input */}
          <input
            type="text"
            value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
            onBlur={handleEndBlur}
            style={{ width: '105px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '4px 6px', textAlign: 'center' }}
            title="End Timestamp (HH:MM:SS,mmm)"
          />

          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            ({durationSec}s)
          </span>
        </div>

        {/* Row Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Reviewed Toggle */}
          <button
            onClick={() => onUpdate({ ...segment, reviewed: !segment.reviewed })}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              color: segment.reviewed ? '#34d399' : 'var(--text-dim)'
            }}
            title={segment.reviewed ? 'Marked as reviewed' : 'Click to mark as reviewed'}
          >
            {segment.reviewed ? <CheckSquare size={16} color="#10b981" /> : <Square size={16} />}
            <span>{segment.reviewed ? 'Reviewed' : 'Review'}</span>
          </button>

          {/* Split at playhead */}
          <button
            onClick={() => onSplit(segment.id)}
            className="btn-icon"
            style={{ width: '28px', height: '28px' }}
            title="Split subtitle into two"
          >
            <Split size={14} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(segment.id)}
            className="btn-icon danger"
            style={{ width: '28px', height: '28px' }}
            title="Delete this segment"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Warnings / Error banner */}
      {(error || warning) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          background: error ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.12)',
          border: error ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '6px',
          color: error ? '#f87171' : '#fbbf24',
          fontSize: '0.76rem',
          marginBottom: '8px'
        }}>
          <AlertTriangle size={13} />
          <span>{error || warning}</span>
        </div>
      )}

      {/* Turkish Original Text (Collapsible) */}
      <div style={{ marginBottom: '8px' }}>
        <div
          onClick={() => setShowTurkish(!showTurkish)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            marginBottom: '4px',
            userSelect: 'none'
          }}
        >
          <span>🇹🇷 Turkish Original:</span>
          {showTurkish ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </div>
        {showTurkish && (
          <div style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            {segment.sourceText || '(No dialogue)'}
          </div>
        )}
      </div>

      {/* Urdu Translated Text Editable Input */}
      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#fb7185', fontWeight: 600, marginBottom: '4px' }}>
          🇵🇰 اردو ترجمہ (Urdu Subtitle):
        </label>
        <textarea
          rows={2}
          value={segment.translatedText}
          onChange={(e) => onUpdate({ ...segment, translatedText: e.target.value })}
          className="urdu-text"
          style={{
            width: '100%',
            fontSize: '1.15rem',
            padding: '8px 12px',
            resize: 'vertical',
            lineHeight: 1.8
          }}
          placeholder="یہاں اردو سب ٹائٹل درج کریں..."
        />
      </div>
    </div>
  );
};

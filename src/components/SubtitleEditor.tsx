import React, { useState } from 'react';
import { Plus, ArrowUpDown, Search, Filter, CheckCircle, Clock } from 'lucide-react';
import { SubtitleSegment, ValidationResult } from '../types/subtitle';
import { SubtitleRow } from './SubtitleRow';

interface SubtitleEditorProps {
  segments: SubtitleSegment[];
  activeSegmentId?: string;
  onUpdateSegment: (updated: SubtitleSegment) => void;
  onDeleteSegment: (id: string) => void;
  onAddSegment: () => void;
  onSplitSegment: (id: string) => void;
  onSortSegments: () => void;
  onJumpToTime: (ms: number) => void;
  validation: ValidationResult;
}

export const SubtitleEditor: React.FC<SubtitleEditorProps> = ({
  segments,
  activeSegmentId,
  onUpdateSegment,
  onDeleteSegment,
  onAddSegment,
  onSplitSegment,
  onSortSegments,
  onJumpToTime,
  validation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReviewed, setFilterReviewed] = useState<'all' | 'unreviewed' | 'reviewed'>('all');

  // Filter segments
  const filteredSegments = segments.filter(seg => {
    const matchesSearch =
      seg.sourceText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seg.translatedText.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterReviewed === 'reviewed') return seg.reviewed;
    if (filterReviewed === 'unreviewed') return !seg.reviewed;
    return true;
  });

  const reviewedCount = segments.filter(s => s.reviewed).length;

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header & Metrics */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Subtitle Timeline</h3>
            <span className="badge badge-primary">{segments.length} Lines</span>
            <span className="badge badge-emerald">{reviewedCount} Reviewed</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Edit Turkish source dialogue or natural Urdu translation
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onSortSegments}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            title="Sort segments sequentially by Start Time"
          >
            <ArrowUpDown size={13} />
            <span>Sort Times</span>
          </button>
          <button
            onClick={onAddSegment}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            <Plus size={15} />
            <span>Add Subtitle</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Urdu or Turkish dialogue..."
            style={{ width: '100%', paddingLeft: '32px', fontSize: '0.85rem' }}
          />
        </div>
        <select
          value={filterReviewed}
          onChange={(e) => setFilterReviewed(e.target.value as any)}
          style={{ fontSize: '0.82rem', padding: '6px 10px', cursor: 'pointer' }}
        >
          <option value="all">All ({segments.length})</option>
          <option value="unreviewed">Needs Review ({segments.length - reviewedCount})</option>
          <option value="reviewed">Reviewed ({reviewedCount})</option>
        </select>
      </div>

      {/* Subtitle Segments List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: '620px',
        paddingRight: '4px'
      }}>
        {filteredSegments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
            <p>No subtitle segments match your filter.</p>
          </div>
        ) : (
          filteredSegments.map((seg, idx) => {
            // Find if this segment has any warning
            const segWarning = validation.warnings.find(w => w.includes(`Segment #${idx + 1}`));
            const segError = validation.errors.find(e => e.includes(`Segment #${idx + 1}`));

            return (
              <SubtitleRow
                key={seg.id}
                segment={seg}
                index={idx}
                isActive={seg.id === activeSegmentId}
                onUpdate={onUpdateSegment}
                onDelete={onDeleteSegment}
                onSplit={onSplitSegment}
                onJumpTo={onJumpToTime}
                warning={segWarning}
                error={segError}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

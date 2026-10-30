import React, { useState, useRef } from 'react';
import { SubtitleSegment, JobData } from '../types/subtitle';
import { SubtitlePreview } from '../components/SubtitlePreview';
import { SubtitleEditor } from '../components/SubtitleEditor';
import { ExportPanel } from '../components/ExportPanel';
import { validateSegments } from '../utils/srt';
import { saveSubtitles, getVideoStreamUrl } from '../services/api';
import { ArrowLeft, CheckCircle2, Film, Clock, Sparkles } from 'lucide-react';
import { formatPlayerTime } from '../utils/time';

interface SubtitleEditorPageProps {
  jobData: JobData;
  initialSegments: SubtitleSegment[];
  onBackToHome: () => void;
}

export const SubtitleEditorPage: React.FC<SubtitleEditorPageProps> = ({
  jobData,
  initialSegments,
  onBackToHome
}) => {
  const [segments, setSegments] = useState<SubtitleSegment[]>(initialSegments);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Derive validation
  const validation = validateSegments(segments);

  // Active segment
  const currentMs = Math.round(currentTime * 1000);
  const activeSegment = segments.find(
    s => currentMs >= s.startMs && currentMs <= s.endMs
  );

  const handleTimeUpdate = (timeSec: number) => {
    setCurrentTime(timeSec);
  };

  const handleJumpToTime = (ms: number) => {
    const sec = ms / 1000;
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
      videoRef.current.play();
    }
    setCurrentTime(sec);
  };

  const handleUpdateSegment = (updated: SubtitleSegment) => {
    setSegments(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleDeleteSegment = (id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
  };

  const handleAddSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const newStart = lastSeg ? lastSeg.endMs + 300 : Math.round(currentTime * 1000);
    const newEnd = newStart + 3000;
    const newId = `seg_${String(segments.length + 1).padStart(4, '0')}`;

    const newSegment: SubtitleSegment = {
      id: newId,
      startMs: newStart,
      endMs: newEnd,
      sourceText: 'Yeni Türkçe diyalog',
      translatedText: 'نیا اردو سب ٹائٹل',
      reviewed: false
    };

    setSegments(prev => [...prev, newSegment]);
  };

  const handleSplitSegment = (id: string) => {
    const target = segments.find(s => s.id === id);
    if (!target) return;

    const playheadMs = Math.round(currentTime * 1000);
    const midPoint = (playheadMs > target.startMs && playheadMs < target.endMs)
      ? playheadMs
      : Math.round((target.startMs + target.endMs) / 2);

    const firstHalf: SubtitleSegment = {
      ...target,
      endMs: midPoint,
      translatedText: target.translatedText.slice(0, Math.ceil(target.translatedText.length / 2)).trim()
    };

    const secondHalf: SubtitleSegment = {
      id: `seg_${Date.now().toString().slice(-4)}`,
      startMs: midPoint + 100,
      endMs: target.endMs,
      sourceText: target.sourceText,
      translatedText: target.translatedText.slice(Math.ceil(target.translatedText.length / 2)).trim(),
      reviewed: false
    };

    setSegments(prev => {
      const idx = prev.findIndex(s => s.id === id);
      const copy = [...prev];
      copy.splice(idx, 1, firstHalf, secondHalf);
      return copy;
    });
  };

  const handleSortSegments = () => {
    setSegments(prev => [...prev].sort((a, b) => a.startMs - b.startMs));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await saveSubtitles(jobData.jobId, segments);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save to backend:', err);
      alert('Could not save to backend. Your edits remain active in memory and can be exported.');
    } finally {
      setIsSaving(false);
    }
  };

  const videoUrl = getVideoStreamUrl(jobData.jobId);
  const reviewedCount = segments.filter(s => s.reviewed).length;
  const reviewedPercent = segments.length > 0 ? Math.round((reviewedCount / segments.length) * 100) : 0;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      {/* Top Navigation & Project Metadata Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBackToHome}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          >
            <ArrowLeft size={15} /> All Videos
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Film size={16} color="#fb7185" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {jobData.originalName}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span>Job ID: {jobData.jobId}</span>
              <span>•</span>
              <span>Duration: {formatPlayerTime(jobData.durationSeconds || 0)}</span>
              <span>•</span>
              <span>{segments.length} Subtitle Segments</span>
            </div>
          </div>
        </div>

        {/* Reviewed Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {saveSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '0.82rem' }}>
              <CheckCircle2 size={16} /> Saved!
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Review Progress: {reviewedPercent}%
            </div>
            <div style={{ width: '120px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${reviewedPercent}%`, height: '100%', background: '#10b981', borderRadius: '3px', transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Studio Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(400px, 1fr) minmax(450px, 1.25fr)',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Column: Video Preview Player & Export Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SubtitlePreview
            videoUrl={videoUrl}
            segments={segments}
            currentTime={currentTime}
            onTimeUpdate={handleTimeUpdate}
            videoRef={videoRef}
          />

          <ExportPanel
            jobId={jobData.jobId}
            originalName={jobData.originalName}
            segments={segments}
            validation={validation}
            onSave={handleSaveChanges}
            isSaving={isSaving}
          />
        </div>

        {/* Right Column: Subtitle Timeline Editor */}
        <div style={{ height: 'calc(100vh - 160px)', position: 'sticky', top: '90px' }}>
          <SubtitleEditor
            segments={segments}
            activeSegmentId={activeSegment?.id}
            onUpdateSegment={handleUpdateSegment}
            onDeleteSegment={handleDeleteSegment}
            onAddSegment={handleAddSegment}
            onSplitSegment={handleSplitSegment}
            onSortSegments={handleSortSegments}
            onJumpToTime={handleJumpToTime}
            validation={validation}
          />
        </div>
      </div>
    </div>
  );
};

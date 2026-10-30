import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, Volume2, Mic, Languages, FileCheck, Layers } from 'lucide-react';
import { JobData, JobStage } from '../types/subtitle';

interface ProcessingStatusProps {
  jobData: JobData;
  onRetry: () => void;
  onCancel?: () => void;
}

const STAGES: { id: JobStage; label: string; urduLabel: string; icon: any }[] = [
  { id: 'extracting_audio', label: 'Audio Extraction', urduLabel: 'آڈیو نکالنا', icon: Volume2 },
  { id: 'transcribing', label: 'Turkish Speech AI', urduLabel: 'ترکی اسپیچ ریکگنیشن', icon: Mic },
  { id: 'translating', label: 'Urdu Translation', urduLabel: 'اردو ترجمہ (نستعلیق)', icon: Languages },
  { id: 'ready_for_review', label: 'Subtitle Review', urduLabel: 'سب ٹائٹل ریویو', icon: FileCheck }
];

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  jobData,
  onRetry,
  onCancel
}) => {
  const isFailed = jobData.status === 'failed';
  const currentStageIndex = STAGES.findIndex(s => s.id === jobData.stage);

  return (
    <div className="glass-panel" style={{ padding: '36px', maxWidth: '780px', margin: '0 auto' }}>
      {/* Status Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: isFailed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(225, 29, 72, 0.15)',
          border: `1px solid ${isFailed ? 'rgba(239, 68, 68, 0.3)' : 'rgba(225, 29, 72, 0.3)'}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isFailed ? '#f87171' : '#fb7185',
          marginBottom: '16px'
        }}>
          {isFailed ? (
            <AlertCircle size={28} />
          ) : (
            <Loader2 size={28} className="animate-spin" />
          )}
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '6px' }}>
          {isFailed ? 'Processing Encountered an Issue' : 'AI Processing Pipeline Active'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          {jobData.message || 'Extracting speech and converting dialogue to Urdu...'}
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Overall Progress</span>
          <span style={{ fontWeight: 600, color: '#fb7185' }}>{jobData.progress}%</span>
        </div>
        <div style={{
          height: '10px',
          borderRadius: '5px',
          background: 'rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(100, Math.max(5, jobData.progress))}%`,
            height: '100%',
            background: isFailed ? '#ef4444' : 'linear-gradient(90deg, #e11d48, #6366f1)',
            borderRadius: '5px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Stage Stepper */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = currentStageIndex > idx || jobData.stage === 'ready_for_review';
          const isCurrent = currentStageIndex === idx && !isDone && !isFailed;

          return (
            <div
              key={stage.id}
              style={{
                padding: '16px 10px',
                borderRadius: '12px',
                textAlign: 'center',
                background: isCurrent
                  ? 'rgba(225, 29, 72, 0.12)'
                  : isDone
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: isCurrent
                  ? '1px solid var(--primary)'
                  : isDone
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : '1px solid var(--border-subtle)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                margin: '0 auto 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDone
                  ? '#10b981'
                  : isCurrent
                  ? '#e11d48'
                  : 'rgba(255, 255, 255, 0.08)',
                color: '#fff'
              }}>
                {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} className={isCurrent ? 'animate-spin' : ''} />}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isCurrent ? '#fb7185' : isDone ? '#34d399' : 'var(--text-muted)' }}>
                {stage.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px', fontFamily: 'var(--font-urdu)' }}>
                {stage.urduLabel}
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Details and Retry */}
      {isFailed && (
        <div style={{
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '10px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '0.88rem', color: '#f87171', fontWeight: 600, marginBottom: '6px' }}>
            Error Details:
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {jobData.error || 'The audio extraction or speech service encountered an error.'}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button onClick={onRetry} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <RefreshCw size={15} /> Retry Processing
            </button>
            {onCancel && (
              <button onClick={onCancel} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Cancel &amp; Start Over
              </button>
            )}
          </div>
        </div>
      )}

      {/* Project Meta Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: 'var(--text-dim)',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <span>Job ID: {jobData.jobId}</span>
        <span>File: {jobData.originalName}</span>
      </div>
    </div>
  );
};

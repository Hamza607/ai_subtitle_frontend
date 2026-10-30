import React from 'react';
import { VideoUploader } from '../components/VideoUploader';
import { ProcessingStatus } from '../components/ProcessingStatus';
import { JobData } from '../types/subtitle';
import { Sparkles, FileText, CheckCircle, Volume2, Languages, Shield, Clock } from 'lucide-react';

interface HomePageProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  activeJob: JobData | null;
  onRetryJob: () => void;
  onCancelJob: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onFileSelected,
  isUploading,
  uploadProgress,
  activeJob,
  onRetryJob,
  onCancelJob
}) => {
  // If a job is currently processing or queued, show the status stepper
  if (activeJob && (activeJob.status === 'processing' || activeJob.status === 'queued' || activeJob.status === 'failed')) {
    return (
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <ProcessingStatus
          jobData={activeJob}
          onRetry={onRetryJob}
          onCancel={onCancelJob}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: 'rgba(225, 29, 72, 0.1)',
          border: '1px solid rgba(225, 29, 72, 0.25)',
          color: '#fb7185',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          <Sparkles size={14} /> AI-Powered Turkish to Urdu Subtitling Engine
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '14px' }}>
          Generate Accurate Urdu Subtitles <br />
          <span style={{
            background: 'linear-gradient(135deg, #fb7185 0%, #e11d48 50%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            From Turkish Drama &amp; Media
          </span>
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Upload your Turkish clip, extract pristine dialogue, transcribe with millimeter timestamps, and translate into beautiful natural Urdu script with instant UTF-8 SRT export.
        </p>
      </div>

      {/* Main Upload Box */}
      <VideoUploader
        onFileSelected={onFileSelected}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />

      {/* Feature Highlights Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginTop: '60px'
      }}>
        {[
          {
            icon: Volume2,
            color: '#fb7185',
            title: 'FFmpeg Audio Isolation',
            desc: 'Extracts 16 kHz mono audio stream automatically to ensure speech transcription accuracy.'
          },
          {
            icon: Languages,
            color: '#34d399',
            title: 'Cultural Urdu Translation',
            desc: 'Preserves drama honorifics (Bey, Hanım, Sultan), idioms, and emotion in authentic Nastaliq Urdu.'
          },
          {
            icon: Clock,
            color: '#fbbf24',
            title: 'Precision Timestamp Sync',
            desc: 'Calculates millisecond boundaries, prevents overlaps, and synchronizes live on the video player.'
          },
          {
            icon: FileText,
            color: '#818cf8',
            title: 'Standard UTF-8 SRT Export',
            desc: 'Downloads universal SubRip files encoded with UTF-8 BOM, compatible with VLC, YouTube, and editing suites.'
          }
        ].map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div key={i} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: `${feat.color}18`,
                border: `1px solid ${feat.color}35`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: feat.color,
                marginBottom: '14px'
              }}>
                <Icon size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{feat.title}</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{feat.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

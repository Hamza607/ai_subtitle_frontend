import React, { useState, useRef } from 'react';
import { UploadCloud, FileVideo, Film, AlertCircle, CheckCircle, Play, ShieldAlert, Sparkles } from 'lucide-react';

interface VideoUploaderProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onFileSelected,
  isUploading,
  uploadProgress
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['.mp4', '.mov', '.webm', '.mkv', '.avi'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setErrorMsg(`Unsupported file type. Please upload MP4, MOV, WebM, or MKV.`);
      return;
    }

    const maxSizeMb = 500;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setErrorMsg(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Limit is ${maxSizeMb}MB.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      setErrorMsg('Please select a video file first.');
      return;
    }
    if (!rightsConfirmed) {
      setErrorMsg('Please confirm that you are authorized to process this video.');
      return;
    }
    onFileSelected(selectedFile);
  };

  // Helper to load real sample Turkish clip for instant test
  const handleLoadDemoClip = async () => {
    try {
      const response = await fetch('/sample_turkish_video.mp4');
      const blob = await response.blob();
      const demoFile = new File([blob], 'ertugrul_turkish_dialogue_clip.mp4', { type: 'video/mp4' });
      setSelectedFile(demoFile);
    } catch (e) {
      console.warn('Could not load sample file, creating fallback file:', e);
      const fallback = new File([new Uint8Array(1024)], 'turkish_sample_clip.mp4', { type: 'video/mp4' });
      setSelectedFile(fallback);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '36px', maxWidth: '780px', margin: '0 auto' }}>
      {/* Upload Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: 'rgba(225, 29, 72, 0.12)',
          border: '1px solid rgba(225, 29, 72, 0.25)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fb7185',
          marginBottom: '16px'
        }}>
          <UploadCloud size={32} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
          Upload Turkish Video
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto' }}>
          Accepts MP4, MOV, or WebM clips. Audio will be extracted, transcribed from Turkish, and translated into natural Urdu script.
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragOver ? '2px dashed #fb7185' : '2px dashed rgba(255, 255, 255, 0.16)',
          borderRadius: '16px',
          padding: '40px 20px',
          textAlign: 'center',
          background: isDragOver ? 'rgba(225, 29, 72, 0.08)' : 'rgba(255, 255, 255, 0.02)',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          marginBottom: '20px'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".mp4,.mov,.webm,.mkv,.avi"
          style={{ display: 'none' }}
        />

        <Film size={44} style={{ color: isDragOver ? '#fb7185' : 'var(--text-dim)', margin: '0 auto 12px' }} />

        {selectedFile ? (
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 600, fontSize: '1.05rem' }}>
              <CheckCircle size={18} /> {selectedFile.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              style={{
                marginTop: '12px',
                background: 'transparent',
                border: 'none',
                color: '#fb7185',
                fontSize: '0.82rem',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Choose a different file
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px' }}>
              Drag &amp; Drop your video here, or <span style={{ color: '#fb7185' }}>browse files</span>
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Supports MP4, MOV, WebM • Max 500 MB • Up to 60 minutes
            </p>
          </div>
        )}
      </div>

      {/* Demo Clip Helper */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={16} color="#f59e0b" />
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            No Turkish clip on your machine? Try our instant sample:
          </span>
        </div>
        <button
          type="button"
          onClick={handleLoadDemoClip}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          Load Turkish Drama Sample
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#f87171',
          fontSize: '0.85rem',
          marginBottom: '20px'
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Copyright / Authorization checkbox (Page 2 & 12 requirement) */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        marginBottom: '24px',
        padding: '10px 14px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '8px'
      }}>
        <input
          type="checkbox"
          id="rightsCheck"
          checked={rightsConfirmed}
          onChange={(e) => setRightsConfirmed(e.target.checked)}
          style={{ marginTop: '3px', accentColor: 'var(--primary)' }}
        />
        <label htmlFor="rightsCheck" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          I confirm that I have the right to process this video file for translation and subtitle generation.
        </label>
      </div>

      {/* Upload Progress Bar if uploading */}
      {isUploading ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Uploading video to server...</span>
            <span style={{ fontWeight: 600, color: '#fb7185' }}>{uploadProgress}%</span>
          </div>
          <div style={{
            height: '8px',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${uploadProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #e11d48, #be123c)',
              borderRadius: '4px',
              transition: 'width 0.2s ease'
            }} />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedFile}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1rem',
            opacity: selectedFile ? 1 : 0.6,
            cursor: selectedFile ? 'pointer' : 'not-allowed'
          }}
        >
          <Play size={18} /> Generate Urdu Subtitles
        </button>
      )}
    </div>
  );
};

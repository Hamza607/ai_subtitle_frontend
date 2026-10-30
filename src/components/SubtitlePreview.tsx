import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize2, Type, Eye } from 'lucide-react';
import { SubtitleSegment } from '../types/subtitle';
import { formatPlayerTime } from '../utils/time';

interface SubtitlePreviewProps {
  videoUrl?: string;
  segments: SubtitleSegment[];
  currentTime: number;
  onTimeUpdate: (timeSec: number) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const SubtitlePreview: React.FC<SubtitlePreviewProps> = ({
  videoUrl,
  segments,
  currentTime,
  onTimeUpdate,
  videoRef
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('large');
  const [useNastaliq, setUseNastaliq] = useState(true);
  const [bgStyle, setBgStyle] = useState<'solid' | 'semi' | 'none'>('semi');

  // Find currently active subtitle segment
  const currentMs = Math.round(currentTime * 1000);
  const activeSegment = segments.find(
    s => currentMs >= s.startMs && currentMs <= s.endMs
  );

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const skipTime = (offsetSec: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + offsetSec));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    onTimeUpdate(time);
  };

  const getFontSizePx = () => {
    switch (fontSize) {
      case 'normal': return '18px';
      case 'large': return '24px';
      case 'xl': return '30px';
      default: return '24px';
    }
  };

  const getBgStyle = () => {
    switch (bgStyle) {
      case 'solid': return 'rgba(0, 0, 0, 0.92)';
      case 'semi': return 'rgba(0, 0, 0, 0.65)';
      case 'none': return 'transparent';
      default: return 'rgba(0, 0, 0, 0.65)';
    }
  };

  return (
    <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Video Container with Overlaid Subtitles */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }}
            onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
            <p>Video preview unavailable</p>
          </div>
        )}

        {/* Live Urdu Subtitle Overlay */}
        {activeSegment && (
          <div className="subtitle-overlay-box">
            <div
              className="subtitle-overlay-text"
              style={{
                fontSize: getFontSizePx(),
                background: getBgStyle(),
                fontFamily: useNastaliq ? 'var(--font-urdu)' : 'inherit',
                textShadow: bgStyle === 'none' ? '0 2px 6px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.8)' : undefined
              }}
            >
              {activeSegment.translatedText}
            </div>
          </div>
        )}
      </div>

      {/* Scrub Bar & Player Controls */}
      <div style={{ padding: '14px 18px', background: 'rgba(12, 17, 29, 0.9)' }}>
        {/* Progress Slider */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          style={{
            width: '100%',
            accentColor: 'var(--primary)',
            cursor: 'pointer',
            height: '6px',
            marginBottom: '12px'
          }}
        />

        {/* Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={togglePlay} className="btn-icon" style={{ width: '38px', height: '38px', color: '#fff' }}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={() => skipTime(-5)} className="btn-icon" title="Rewind 5s">
              <RotateCcw size={16} />
            </button>
            <button onClick={() => skipTime(5)} className="btn-icon" title="Forward 5s">
              <RotateCw size={16} />
            </button>
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              className="btn-icon"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginLeft: '6px' }}>
              {formatPlayerTime(currentTime)} / {formatPlayerTime(duration)}
            </span>
          </div>

          {/* Subtitle Appearance Settings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', padding: '3px 8px', borderRadius: '8px', fontSize: '0.78rem' }}>
              <Type size={13} color="var(--text-muted)" />
              <button
                onClick={() => setFontSize(fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xl' : 'normal')}
                style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}
              >
                Size: {fontSize.toUpperCase()}
              </button>
            </div>

            <button
              onClick={() => setUseNastaliq(!useNastaliq)}
              className="btn-secondary"
              style={{
                padding: '4px 8px',
                fontSize: '0.78rem',
                color: useNastaliq ? '#34d399' : 'var(--text-muted)'
              }}
              title="Toggle Noto Nastaliq Font"
            >
              نستعلیق
            </button>

            <button
              onClick={() => setBgStyle(bgStyle === 'semi' ? 'solid' : bgStyle === 'solid' ? 'none' : 'semi')}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.78rem' }}
              title="Subtitle Box Style"
            >
              Box: {bgStyle}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

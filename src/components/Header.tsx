import React from 'react';
import { KeyRound, History, Sparkles, Languages, CheckCircle2, RefreshCw } from 'lucide-react';

interface HeaderProps {
  apiKey: string;
  provider: string;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  isBackendHealthy: boolean;
  onNewProject?: () => void;
  hasActiveJob?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  apiKey,
  provider,
  onOpenSettings,
  onOpenHistory,
  isBackendHealthy,
  onNewProject,
  hasActiveJob
}) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={onNewProject}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(225, 29, 72, 0.4)',
            fontSize: '20px'
          }}>
            🇹🇷
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                Turkish-to-Urdu <span style={{ color: '#fb7185' }}>AI Subtitles</span>
              </h1>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                <Languages size={12} /> TR ➔ UR
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ترکی ویڈیو سے اردو سب ٹائٹلز • AI Speech &amp; SRT Generator
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Backend Status indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            padding: '6px 12px',
            borderRadius: '20px',
            background: isBackendHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isBackendHealthy ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
            color: isBackendHealthy ? '#34d399' : '#f87171'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isBackendHealthy ? '#10b981' : '#ef4444'
            }}></span>
            {isBackendHealthy ? 'Backend Connected' : 'Backend Connecting...'}
          </div>

          {/* AI Mode badge */}
          <button
            onClick={onOpenSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: apiKey ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${apiKey ? 'rgba(99, 102, 241, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              color: apiKey ? '#a5b4fc' : '#fbbf24',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500
            }}
            title="Configure Speech & Translation Provider"
          >
            <KeyRound size={13} />
            {apiKey ? `${provider.toUpperCase()} AI Active` : 'Built-in AI Mode'}
          </button>

          {/* Project History */}
          <button
            onClick={onOpenHistory}
            className="btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.82rem' }}
            title="Project History"
          >
            <History size={15} />
            <span>History</span>
          </button>

          {hasActiveJob && (
            <button
              onClick={onNewProject}
              className="btn-primary"
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} />
              <span>New Video</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

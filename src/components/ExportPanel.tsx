import React, { useState } from 'react';
import { Download, Copy, Check, FileText, AlertTriangle, Save, Sparkles, FileCode } from 'lucide-react';
import { SubtitleSegment, ValidationResult } from '../types/subtitle';
import { toSrt, downloadFile } from '../utils/srt';
import { getExportSrtUrl, getExportJsonUrl } from '../services/api';

interface ExportPanelProps {
  jobId: string;
  originalName: string;
  segments: SubtitleSegment[];
  validation: ValidationResult;
  onSave: () => void;
  isSaving: boolean;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  jobId,
  originalName,
  segments,
  validation,
  onSave,
  isSaving
}) => {
  const [copied, setCopied] = useState(false);

  const baseName = originalName.replace(/\.[^/.]+$/, '');

  const handleDownloadSrtClient = () => {
    const srtText = toSrt(segments);
    downloadFile(srtText, `${baseName}_urdu.srt`, 'text/plain;charset=utf-8');
  };

  const handleDownloadJsonClient = () => {
    const project = {
      version: '1.0',
      jobId,
      originalName,
      exportedAt: new Date().toISOString(),
      segments
    };
    downloadFile(JSON.stringify(project, null, 2), `${baseName}_project.json`, 'application/json');
  };

  const handleCopyClipboard = async () => {
    try {
      const srtText = toSrt(segments);
      await navigator.clipboard.writeText(srtText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  const hasWarnings = validation.warnings && validation.warnings.length > 0;
  const hasErrors = validation.errors && validation.errors.length > 0;

  return (
    <div className="glass-panel" style={{ padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Export &amp; Deliverables</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            UTF-8 standard SubRip (.srt) with millisecond precision
          </p>
        </div>

        {/* Save to backend button */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '6px 14px' }}
        >
          <Save size={14} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Validation Alert Box if warnings exist */}
      {(hasWarnings || hasErrors) && (
        <div style={{
          padding: '12px 14px',
          borderRadius: '10px',
          background: hasErrors ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: hasErrors ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hasErrors ? '#f87171' : '#fbbf24', fontSize: '0.84rem', fontWeight: 600 }}>
            <AlertTriangle size={15} />
            <span>
              {hasErrors ? `${validation.errors.length} Timing Errors` : `${validation.warnings.length} Subtitle Warnings`}
            </span>
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {hasErrors ? validation.errors[0] : validation.warnings[0]}
          </div>
        </div>
      )}

      {/* Export Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        {/* Download SRT */}
        <button
          onClick={handleDownloadSrtClient}
          className="btn-primary"
          style={{ padding: '10px 14px', fontSize: '0.86rem' }}
          title="Download UTF-8 SRT Subtitle file"
        >
          <Download size={16} />
          <span>Download SRT</span>
        </button>

        {/* Copy SRT */}
        <button
          onClick={handleCopyClipboard}
          className="btn-secondary"
          style={{ padding: '10px 14px', fontSize: '0.86rem' }}
          title="Copy SRT contents to clipboard"
        >
          {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
          <span>{copied ? 'Copied SRT!' : 'Copy SRT'}</span>
        </button>

        {/* Download JSON Project */}
        <button
          onClick={handleDownloadJsonClient}
          className="btn-secondary"
          style={{ padding: '10px 14px', fontSize: '0.86rem' }}
          title="Download Project JSON for backup"
        >
          <FileCode size={16} />
          <span>Project JSON</span>
        </button>
      </div>

      {/* Direct server download links */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        <span>Direct Backend links:</span>
        <a
          href={getExportSrtUrl(jobId)}
          target="_blank"
          rel="noreferrer"
          style={{ color: '#fb7185', textDecoration: 'underline' }}
        >
          export.srt
        </a>
        <span>•</span>
        <a
          href={getExportJsonUrl(jobId)}
          target="_blank"
          rel="noreferrer"
          style={{ color: '#a5b4fc', textDecoration: 'underline' }}
        >
          export.json
        </a>
      </div>
    </div>
  );
};

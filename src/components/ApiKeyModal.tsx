import React, { useState } from 'react';
import { X, Key, Sparkles, Check, ShieldCheck, Info } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  currentProvider: string;
  onSave: (apiKey: string, provider: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentApiKey,
  currentProvider,
  onSave
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [provider, setProvider] = useState(currentProvider || 'builtin');
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  React.useEffect(() => {
    setApiKey(currentApiKey);
    setProvider(currentProvider || 'builtin');
  }, [currentApiKey, currentProvider, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKey.trim(), provider);
    setShowSavedMsg(true);
    setTimeout(() => {
      setShowSavedMsg(false);
      onClose();
    }, 800);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '28px',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: '18px', right: '18px' }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(225, 29, 72, 0.15)',
            border: '1px solid rgba(225, 29, 72, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fb7185'
          }}>
            <Key size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Provider Settings</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Configure speech transcription and Urdu translation
            </p>
          </div>
        </div>

        {/* Provider Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
            Speech &amp; Translation Engine
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { id: 'builtin', name: 'Built-in Engine', desc: 'No Key Required' },
              { id: 'groq', name: 'Groq Cloud', desc: 'Ultra-Fast Whisper' },
              { id: 'openai', name: 'OpenAI', desc: 'Whisper-1 & GPT' }
            ].map(item => (
              <div
                key={item.id}
                onClick={() => setProvider(item.id)}
                style={{
                  padding: '12px 10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: provider === item.id ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: provider === item.id ? 'rgba(225, 29, 72, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: provider === item.id ? '#fb7185' : '#fff' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Key Input (if not builtin) */}
        {provider !== 'builtin' ? (
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
              {provider === 'groq' ? 'Groq API Key (starts with gsk_...)' : 'OpenAI API Key (starts with sk-...)'}
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === 'groq' ? 'gsk_...' : 'sk-...'}
              style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Keys are stored in your browser session and forwarded securely to the server.</span>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '14px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            marginBottom: '22px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <Sparkles size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              <strong>Zero-Setup Mode:</strong> Uses the built-in authentic Turkish speech alignment model and contextual Urdu drama dialogue engine. Ideal for testing clips without requiring external paid API keys!
            </div>
          </div>
        )}

        {/* Privacy Note */}
        <div style={{
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginBottom: '20px'
        }}>
          <Info size={15} color="#94a3b8" />
          <span>Section 9 &amp; 12 Compliance: API keys are never exposed in public bundles.</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            {showSavedMsg ? (
              <>
                <Check size={16} /> Saved!
              </>
            ) : (
              'Save & Apply'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

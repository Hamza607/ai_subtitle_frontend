import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ProjectHistory } from './components/ProjectHistory';
import { HomePage } from './pages/HomePage';
import { SubtitleEditorPage } from './pages/SubtitleEditorPage';
import { JobData, SubtitleSegment } from './types/subtitle';
import {
  uploadVideoFile,
  getJobStatus,
  getSubtitles,
  retryJob,
  deleteJob
} from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'editor'>('home');
  const [activeJob, setActiveJob] = useState<JobData | null>(null);
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Settings & Modals
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('turkish_urdu_api_key') || '');
  const [provider, setProvider] = useState(() => localStorage.getItem('turkish_urdu_provider') || 'builtin');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);

  const pollIntervalRef = useRef<number | null>(null);

  // Check backend health on mount and every 10 seconds
  const checkHealth = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/health');
      if (res.ok) {
        setIsBackendHealthy(true);
      } else {
        setIsBackendHealthy(false);
      }
    } catch {
      setIsBackendHealthy(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = window.setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Poll active job status when in processing or queued
  useEffect(() => {
    if (!activeJob || (activeJob.status !== 'queued' && activeJob.status !== 'processing')) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const pollStatus = async () => {
      try {
        const data = await getJobStatus(activeJob.jobId);
        setActiveJob(data);

        // If job completed processing, transition to editor
        if (data.status === 'ready_for_review') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          const subs = await getSubtitles(data.jobId);
          setSegments(subs.segments || []);
          setCurrentView('editor');
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    };

    pollIntervalRef.current = window.setInterval(pollStatus, 1500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [activeJob?.jobId, activeJob?.status]);

  // Handle Video Upload
  const handleFileSelected = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadVideoFile(
        file,
        (pct) => setUploadProgress(pct),
        apiKey,
        provider
      );

      setIsUploading(false);

      // Set initial active job state
      setActiveJob({
        jobId: response.jobId,
        status: 'queued',
        stage: 'queued',
        progress: 10,
        message: 'Video uploaded. Extracting audio and running speech AI...',
        originalName: response.originalName
      });
    } catch (err: any) {
      setIsUploading(false);
      alert(`Upload failed: ${err.message || 'Please check if backend is running.'}`);
    }
  };

  // Retry Failed Job
  const handleRetryJob = async () => {
    if (!activeJob) return;
    try {
      await retryJob(activeJob.jobId, apiKey, provider);
      setActiveJob(prev => prev ? { ...prev, status: 'processing', stage: 'queued', progress: 10, error: null } : null);
    } catch (err: any) {
      alert(`Retry failed: ${err.message}`);
    }
  };

  // Cancel / Reset
  const handleCancelJob = () => {
    if (activeJob) {
      deleteJob(activeJob.jobId).catch(() => {});
    }
    setActiveJob(null);
    setCurrentView('home');
  };

  // Save Settings Modal
  const handleSaveSettings = (newKey: string, newProv: string) => {
    setApiKey(newKey);
    setProvider(newProv);
    localStorage.setItem('turkish_urdu_api_key', newKey);
    localStorage.setItem('turkish_urdu_provider', newProv);
  };

  // Select project from history
  const handleSelectProject = async (jobId: string) => {
    try {
      const statusData = await getJobStatus(jobId);
      setActiveJob(statusData);

      if (statusData.status === 'ready_for_review') {
        const subs = await getSubtitles(jobId);
        setSegments(subs.segments || []);
        setCurrentView('editor');
      } else {
        setCurrentView('home');
      }
    } catch (err: any) {
      alert(`Could not load project: ${err.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Global Header */}
      <Header
        apiKey={apiKey}
        provider={provider}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        isBackendHealthy={isBackendHealthy}
        onNewProject={() => {
          setActiveJob(null);
          setCurrentView('home');
        }}
        hasActiveJob={currentView === 'editor'}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentView === 'home' || !activeJob ? (
          <HomePage
            onFileSelected={handleFileSelected}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            activeJob={activeJob}
            onRetryJob={handleRetryJob}
            onCancelJob={handleCancelJob}
          />
        ) : (
          <SubtitleEditorPage
            jobData={activeJob}
            initialSegments={segments}
            onBackToHome={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Global Modals */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentApiKey={apiKey}
        currentProvider={provider}
        onSave={handleSaveSettings}
      />

      <ProjectHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectProject={handleSelectProject}
      />
    </div>
  );
}

export default App;

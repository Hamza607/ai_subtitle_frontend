import React, { useEffect, useState } from 'react';
import { X, History, Trash2, FolderOpen, RefreshCw, FileText } from 'lucide-react';
import { ProjectSummary } from '../types/subtitle';
import { listJobs, deleteJob } from '../services/api';

interface ProjectHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (jobId: string) => void;
}

export const ProjectHistory: React.FC<ProjectHistoryProps> = ({
  isOpen,
  onClose,
  onSelectProject
}) => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await listJobs();
      setProjects(data.jobs || []);
    } catch (e) {
      console.error('Error fetching jobs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project and its media files?')) {
      await deleteJob(jobId);
      setProjects(prev => prev.filter(p => p.jobId !== jobId));
    }
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
        maxWidth: '650px',
        width: '100%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '26px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: '18px', right: '18px' }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <History size={22} color="#fb7185" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Project History</h2>
          <button
            onClick={fetchProjects}
            className="btn-icon"
            style={{ width: '28px', height: '28px', marginLeft: 'auto', marginRight: '36px' }}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Project List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
              No projects saved yet. Upload a Turkish video to start!
            </div>
          ) : (
            projects.map(proj => (
              <div
                key={proj.jobId}
                onClick={() => {
                  onSelectProject(proj.jobId);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                      {proj.originalName}
                    </span>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                      {proj.segmentsCount} subtitles
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Job ID: {proj.jobId} • Status: {proj.status} • {new Date(proj.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={(e) => handleDelete(proj.jobId, e)}
                    className="btn-icon danger"
                    style={{ width: '30px', height: '30px' }}
                    title="Delete Project"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <FolderOpen size={14} /> Open
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

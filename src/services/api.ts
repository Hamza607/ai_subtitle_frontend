import { JobData, SubtitleSegment, ProjectSummary } from '../types/subtitle';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Upload video file with progress tracking
 */
export function uploadVideoFile(
  file: File,
  onProgress: (pct: number) => void,
  apiKey?: string,
  provider?: string
): Promise<{ jobId: string; status: string; originalName: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('video', file);

    if (apiKey) {
      formData.append('apiKey', apiKey);
    }
    if (provider) {
      formData.append('provider', provider);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const pct = Math.round((event.loaded / event.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (e) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));

    xhr.open('POST', `${API_BASE_URL}/jobs`);
    if (apiKey) {
      xhr.setRequestHeader('x-api-key', apiKey);
    }
    if (provider) {
      xhr.setRequestHeader('x-api-provider', provider);
    }
    xhr.send(formData);
  });
}

/**
 * Poll job status
 */
export async function getJobStatus(jobId: string): Promise<JobData> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch job status (${response.status})`);
  }
  return response.json();
}

/**
 * Fetch subtitle segments for a job
 */
export async function getSubtitles(jobId: string): Promise<{ segments: SubtitleSegment[] }> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/subtitles`);
  if (!response.ok) {
    throw new Error(`Failed to load subtitles (${response.status})`);
  }
  return response.json();
}

/**
 * Save edited subtitle segments
 */
export async function saveSubtitles(jobId: string, segments: SubtitleSegment[]): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/subtitles`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segments })
  });
  if (!response.ok) {
    throw new Error(`Failed to save subtitles (${response.status})`);
  }
  return response.json();
}

/**
 * Retry failed job
 */
export async function retryJob(jobId: string, apiKey?: string, provider?: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/retry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-api-key': apiKey } : {}),
      ...(provider ? { 'x-api-provider': provider } : {})
    },
    body: JSON.stringify({ apiKey, provider })
  });
  if (!response.ok) {
    throw new Error(`Failed to retry job (${response.status})`);
  }
  return response.json();
}

/**
 * Delete job & media files
 */
export async function deleteJob(jobId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(`Failed to delete job (${response.status})`);
  }
  return response.json();
}

/**
 * List past project jobs
 */
export async function listJobs(): Promise<{ jobs: ProjectSummary[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`);
    if (!response.ok) return { jobs: [] };
    return response.json();
  } catch {
    return { jobs: [] };
  }
}

export function getVideoStreamUrl(jobId: string): string {
  return `${API_BASE_URL}/jobs/${jobId}/video`;
}

export function getExportSrtUrl(jobId: string): string {
  return `${API_BASE_URL}/jobs/${jobId}/export.srt`;
}

export function getExportJsonUrl(jobId: string): string {
  return `${API_BASE_URL}/jobs/${jobId}/export.json`;
}

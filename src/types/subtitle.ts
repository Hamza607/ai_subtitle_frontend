export type SubtitleSegment = {
  id: string;
  startMs: number;
  endMs: number;
  sourceText: string;
  translatedText: string;
  speaker?: string | null;
  reviewed: boolean;
};

export type JobStatus = 'queued' | 'processing' | 'ready_for_review' | 'completed' | 'failed';

export type JobStage = 
  | 'queued' 
  | 'extracting_audio' 
  | 'transcribing' 
  | 'translating' 
  | 'ready_for_review';

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

export interface JobData {
  jobId: string;
  status: JobStatus;
  stage: JobStage;
  progress: number;
  message: string;
  originalName: string;
  durationSeconds?: number;
  videoUrl?: string;
  validation?: ValidationResult;
  error?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectSummary {
  jobId: string;
  originalName: string;
  status: JobStatus;
  stage: JobStage;
  segmentsCount: number;
  createdAt: string;
  updatedAt: string;
}

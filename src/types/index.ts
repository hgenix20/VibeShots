export interface Idea {
  id: string;
  text: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at?: string;
  video_url?: string;
  error?: string;
  user_id?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProcessingStats {
  totalIdeas: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
}
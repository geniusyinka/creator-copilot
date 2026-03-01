import type { InterruptionContent } from './interruption';
import type { Intensity } from './session';

export type WSClientMessage =
  | { type: 'config'; platform: string; intensity: string; description?: string }
  | { type: 'video_frame'; data: string }
  | { type: 'audio_chunk'; data: string }
  | { type: 'manual_check' }
  | { type: 'settings_update'; intensity?: string }
  | { type: 'end_session' };

export type WSServerMessage =
  | { type: 'status'; status: 'ready' | 'processing' | 'error' }
  | { type: 'interruption'; content: InterruptionContent; audio?: string }
  | { type: 'summary'; data: SessionSummaryData }
  | { type: 'error'; message: string };

export interface SessionSummaryData {
  session_id: string;
  duration_seconds: number;
  platform: string;
  interruption_count: number;
  issues_caught: string[];
  issues_fixed: string[];
  final_recommendations: string[];
}

export type Platform = 'youtube' | 'tiktok' | 'linkedin' | 'twitter';

export type SessionStatus = 'setup' | 'active' | 'paused' | 'ended';

export type Intensity = 'aggressive' | 'balanced' | 'light' | 'muted';

export type InputMode = 'camera' | 'screen';

export interface SessionSettings {
  intensity: Intensity;
  voiceId: string;
  inputMode: InputMode;
}

export interface Session {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  platform: Platform;
  contentDescription?: string;
  settings: SessionSettings;
  interruptions: import('./interruption').Interruption[];
  status: SessionStatus;
}

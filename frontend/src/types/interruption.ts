export type InterruptionType = 'critical' | 'suggestion' | 'positive';

export type UserResponse = 'acknowledged' | 'expanded' | 'dismissed' | 'pending';

export interface InterruptionContent {
  raw: string;
  issue?: string;
  advice?: string;
  example?: string;
  why?: string;
  type: InterruptionType;
}

export interface Interruption {
  id: string;
  timestamp: Date;
  type: InterruptionType;
  issue?: string;
  advice: string;
  example?: string;
  platformContext?: string;
  userResponse: UserResponse;
}

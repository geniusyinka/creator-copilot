import type { Platform } from './session';

export interface PlatformConfig {
  id: Platform;
  name: string;
  icon: string;
  hookMaxTime: number;
  idealLength: string;
  keyRules: string[];
  commonMistakes: string[];
}

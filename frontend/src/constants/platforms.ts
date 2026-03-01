import { PlatformConfig } from '../types/platform';

export const PLATFORMS: Record<string, PlatformConfig> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: 'Youtube',
    hookMaxTime: 10,
    idealLength: '8-15 minutes',
    keyRules: [
      'Hook viewers in first 10 seconds',
      'Pattern interrupt by 30 seconds',
      'Deliver on hook promise by 30% mark',
      'Visual change every 5-8 seconds',
      'End screen in last 20 seconds',
    ],
    commonMistakes: [
      'Long intros before value',
      'Burying the best content',
      'Asking for engagement too early',
      'No clear thumbnail moment',
      'Ending without CTA',
    ],
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'Music2',
    hookMaxTime: 0,
    idealLength: '15-60 seconds',
    keyRules: [
      'No introductions - start immediately',
      'One idea per video',
      'Get to the point instantly',
      'Text overlay recommended',
      'Loop-friendly endings are a bonus',
    ],
    commonMistakes: [
      'Starting with context',
      'Multiple ideas in one video',
      'Too professional/polished',
      'No text overlay',
      'Content over 60s without hooks',
    ],
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'Linkedin',
    hookMaxTime: 2,
    idealLength: '150-300 words',
    keyRules: [
      'First 2 lines must work above the fold',
      'Short lines (1-2 sentences)',
      'White space between every 2-3 lines',
      'Professional but human tone',
      'End with question to audience',
    ],
    commonMistakes: [
      'Walls of text',
      'Starting with "Excited to announce"',
      'Too many hashtags',
      'Obvious self-promotion',
      'Lacking specific details',
    ],
  },
  twitter: {
    id: 'twitter',
    name: 'X / Twitter',
    icon: 'Twitter',
    hookMaxTime: 0,
    idealLength: '280 chars or 5-10 tweet thread',
    keyRules: [
      'First line must work standalone',
      'Each tweet in thread must be valuable alone',
      'Scroll-stopping opening required',
      'Last tweet should have CTA',
      'Hot takes encouraged',
    ],
    commonMistakes: [
      'First tweet is just "Thread:"',
      'Not enough white space',
      'Too many links',
      'Thread too long without value density',
    ],
  },
};

export const INTENSITY_OPTIONS = [
  { value: 'aggressive' as const, label: 'Aggressive', description: 'Interrupt frequently, catch everything' },
  { value: 'balanced' as const, label: 'Balanced', description: 'Interrupt for significant issues only' },
  { value: 'light' as const, label: 'Light Touch', description: 'Only critical issues' },
  { value: 'muted' as const, label: 'Muted', description: 'AI watches but doesn\'t interrupt' },
];

import type { SessionSettings } from '../types';

export interface CreatorProfile {
  platforms: string[];
  niche: string;
  style: string;
}

const STORAGE_KEYS = {
  PROFILE: 'creator_copilot_profile',
  SETTINGS: 'creator_copilot_settings',
} as const;

export const StorageService = {
  getProfile(): CreatorProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) return null;
      return JSON.parse(data) as CreatorProfile;
    } catch {
      console.error('Failed to parse stored profile');
      return null;
    }
  },

  saveProfile(profile: CreatorProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      console.error('Failed to save profile to localStorage');
    }
  },

  getSettings(): SessionSettings | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return null;
      return JSON.parse(data) as SessionSettings;
    } catch {
      console.error('Failed to parse stored settings');
      return null;
    }
  },

  saveSettings(settings: SessionSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      console.error('Failed to save settings to localStorage');
    }
  },

  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch {
      console.error('Failed to clear localStorage');
    }
  },
};

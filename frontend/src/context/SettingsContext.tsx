import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Intensity } from '../types';
import { StorageService } from '../services/StorageService';

interface Settings {
  intensity: Intensity;
  voiceId: string;
  platforms: string[];
  niche: string;
  style: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  resetSettings: () => void;
  hasCompletedSetup: boolean;
  setHasCompletedSetup: (val: boolean) => void;
}

const defaultSettings: Settings = {
  intensity: 'balanced',
  voiceId: 'en-US-Neural2-F',
  platforms: [],
  niche: '',
  style: 'educational',
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = StorageService.getProfile();
    const savedSettings = StorageService.getSettings();
    return {
      ...defaultSettings,
      ...(saved && { platforms: saved.platforms, niche: saved.niche, style: saved.style }),
      ...(savedSettings && { intensity: savedSettings.intensity, voiceId: savedSettings.voiceId }),
    };
  });
  const [hasCompletedSetup, setHasCompletedSetup] = useState(() => {
    return StorageService.getProfile() !== null;
  });

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      StorageService.saveProfile({ platforms: next.platforms, niche: next.niche, style: next.style });
      StorageService.saveSettings({ intensity: next.intensity, voiceId: next.voiceId, inputMode: 'camera' });
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    StorageService.clearAll();
    setHasCompletedSetup(false);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, hasCompletedSetup, setHasCompletedSetup }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}

import { useState, useRef, useCallback } from 'react';
import { AudioService } from '../services/AudioService';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioServiceRef = useRef<AudioService>(new AudioService());

  const playAudio = useCallback(async (base64Audio: string) => {
    try {
      setIsPlaying(true);
      await audioServiceRef.current.playAudio(base64Audio);
    } catch (error) {
      console.error('Failed to play audio:', error);
    } finally {
      setIsPlaying(false);
    }
  }, []);

  const playChime = useCallback(() => {
    audioServiceRef.current.playChime();
  }, []);

  return { playAudio, playChime, isPlaying };
}

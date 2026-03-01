import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioService } from '../services/AudioService';

export function useMicrophone() {
  const [isActive, setIsActive] = useState(false);
  const audioServiceRef = useRef<AudioService>(new AudioService());

  const startMicrophone = useCallback(async () => {
    try {
      await audioServiceRef.current.startCapture();
      setIsActive(true);
    } catch (error) {
      console.error('Failed to start microphone:', error);
      throw error;
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    audioServiceRef.current.stopCapture();
    setIsActive(false);
  }, []);

  const onAudioData = useCallback((handler: (data: string) => void) => {
    audioServiceRef.current.onAudioData(handler);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioServiceRef.current.isCapturing()) {
        audioServiceRef.current.stopCapture();
      }
    };
  }, []);

  return { isActive, startMicrophone, stopMicrophone, onAudioData };
}

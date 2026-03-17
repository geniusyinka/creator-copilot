import { useState, useCallback, useRef, useEffect } from 'react';
import type { Interruption, InterruptionContent } from '../types';

const AUTO_DISMISS_MS = 8000;

export function useInterruption() {
  const [interruptions, setInterruptions] = useState<Interruption[]>([]);
  const [activeInterruption, setActiveInterruption] = useState<Interruption | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const dismissTimerRef = useRef<number | null>(null);

  // Clear any running dismiss timer
  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current !== null) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  // Start auto-dismiss countdown
  const startDismissTimer = useCallback(() => {
    clearDismissTimer();
    dismissTimerRef.current = window.setTimeout(() => {
      setActiveInterruption((current) => {
        if (current) {
          setInterruptions((prev) =>
            prev.map((i) =>
              i.id === current.id && i.userResponse === 'pending'
                ? { ...i, userResponse: 'dismissed' }
                : i
            )
          );
        }
        return null;
      });
    }, AUTO_DISMISS_MS);
  }, [clearDismissTimer]);

  // New interruption replaces current (no queue)
  const addInterruption = useCallback((content: InterruptionContent) => {
    const interruption: Interruption = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: content.type,
      advice: content.advice ?? content.raw,
      userResponse: 'pending',
    };

    // Dismiss current if one exists
    setActiveInterruption((current) => {
      if (current) {
        setInterruptions((prev) =>
          prev.map((i) =>
            i.id === current.id && i.userResponse === 'pending'
              ? { ...i, userResponse: 'dismissed' }
              : i
          )
        );
      }
      return interruption;
    });

    setInterruptions((prev) => [...prev, interruption]);
    startDismissTimer();
  }, [startDismissTimer]);

  const dismissInterruption = useCallback(() => {
    clearDismissTimer();
    setActiveInterruption((current) => {
      if (current) {
        setInterruptions((prev) =>
          prev.map((i) =>
            i.id === current.id && i.userResponse === 'pending'
              ? { ...i, userResponse: 'dismissed' }
              : i
          )
        );
      }
      return null;
    });
  }, [clearDismissTimer]);

  const acknowledgeInterruption = useCallback(() => {
    clearDismissTimer();
    setActiveInterruption((current) => {
      if (current) {
        setInterruptions((prev) =>
          prev.map((i) =>
            i.id === current.id && i.userResponse === 'pending'
              ? { ...i, userResponse: 'acknowledged' }
              : i
          )
        );
      }
      return null;
    });
  }, [clearDismissTimer]);

  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearDismissTimer();
  }, [clearDismissTimer]);

  return {
    interruptions,
    activeInterruption,
    showHistory,
    addInterruption,
    acknowledgeInterruption,
    dismissInterruption,
    toggleHistory,
  };
}

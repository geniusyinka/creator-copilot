import { useState, useCallback } from 'react';
import type { Interruption, InterruptionContent, UserResponse } from '../types';

export function useInterruption() {
  const [interruptions, setInterruptions] = useState<Interruption[]>([]);
  const [activeInterruption, setActiveInterruption] = useState<Interruption | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const addInterruption = useCallback((content: InterruptionContent) => {
    const interruption: Interruption = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: content.type,
      issue: content.issue,
      advice: content.advice ?? content.raw,
      example: content.example,
      userResponse: 'pending',
    };

    setInterruptions((prev) => [...prev, interruption]);
    setActiveInterruption(interruption);
  }, []);

  const respondToInterruption = useCallback((id: string, response: UserResponse) => {
    setInterruptions((prev) =>
      prev.map((interruption) =>
        interruption.id === id
          ? { ...interruption, userResponse: response }
          : interruption
      )
    );

    setActiveInterruption((current) => {
      if (current?.id === id) {
        return { ...current, userResponse: response };
      }
      return current;
    });
  }, []);

  const dismissInterruption = useCallback(() => {
    if (activeInterruption) {
      setInterruptions((prev) =>
        prev.map((interruption) =>
          interruption.id === activeInterruption.id && interruption.userResponse === 'pending'
            ? { ...interruption, userResponse: 'dismissed' }
            : interruption
        )
      );
      setActiveInterruption(null);
    }
  }, [activeInterruption]);

  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  return {
    interruptions,
    activeInterruption,
    showHistory,
    addInterruption,
    respondToInterruption,
    dismissInterruption,
    toggleHistory,
  };
}

import { useState, useEffect } from 'react';
import type { InterruptionType } from '../../types';

const typeColors: Record<InterruptionType, string> = {
  critical: '#EF4444',
  suggestion: '#F59E0B',
  positive: '#10B981',
};

interface InterruptionCardProps {
  interruption: {
    type: InterruptionType;
    advice?: string;
  };
  onAcknowledge: () => void;
}

export default function InterruptionCard({
  interruption,
  onAcknowledge,
}: InterruptionCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const barColor = typeColors[interruption.type];

  // Slide in on mount
  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 20);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      onClick={onAcknowledge}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        opacity: isVisible ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'rgba(30, 41, 59, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid #475569',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'row' as const,
        cursor: 'pointer',
        maxWidth: 420,
      }}
    >
      {/* Thin color bar */}
      <div
        style={{
          width: 4,
          flexShrink: 0,
          background: barColor,
          borderRadius: '12px 0 0 12px',
        }}
      />

      {/* Advice text */}
      <p
        style={{
          margin: 0,
          padding: '14px 16px',
          fontSize: 14,
          fontWeight: 400,
          color: '#F8FAFC',
          lineHeight: 1.5,
        }}
      >
        {interruption.advice}
      </p>
    </div>
  );
}

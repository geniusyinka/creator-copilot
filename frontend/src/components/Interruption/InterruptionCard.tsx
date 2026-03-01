import React, { useState, useEffect } from 'react';
import { Target, Lightbulb, CheckCircle } from 'lucide-react';
import type { InterruptionType } from '../../types';

const colors = {
  primary: '#6366F1',
  bgPrimary: '#0F172A',
  bgSecondary: '#1E293B',
  bgCard: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#475569',
  critical: '#EF4444',
  suggestion: '#F59E0B',
  positive: '#10B981',
};

const typeConfig: Record<
  InterruptionType,
  { color: string; icon: React.ReactNode; label: string }
> = {
  critical: {
    color: colors.critical,
    icon: <Target size={20} />,
    label: 'Critical',
  },
  suggestion: {
    color: colors.suggestion,
    icon: <Lightbulb size={20} />,
    label: 'Suggestion',
  },
  positive: {
    color: colors.positive,
    icon: <CheckCircle size={20} />,
    label: 'Nice!',
  },
};

interface InterruptionCardProps {
  interruption: {
    type: InterruptionType;
    issue?: string;
    advice?: string;
    example?: string;
    platformContext?: string;
  };
  onAcknowledge: () => void;
  onExpand: () => void;
  onDismiss: () => void;
}

export default function InterruptionCard({
  interruption,
  onAcknowledge,
  onExpand,
  onDismiss,
}: InterruptionCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const config = typeConfig[interruption.type];

  // Trigger slide-up animation on mount
  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 20);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        opacity: isVisible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'rgba(30, 41, 59, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'row' as const,
      }}
    >
      {/* Left color bar */}
      <div
        style={{
          width: 4,
          flexShrink: 0,
          background: config.color,
          borderRadius: '16px 0 0 16px',
        }}
      />

      {/* Content area */}
      <div
        style={{
          flex: 1,
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Header: Icon + type label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', color: config.color }}>
            {config.icon}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: config.color,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {config.label}
          </span>
        </div>

        {/* Issue text (bold) */}
        {interruption.issue && (
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: colors.textPrimary,
              lineHeight: 1.45,
            }}
          >
            {interruption.issue}
          </p>
        )}

        {/* Advice text */}
        {interruption.advice && (
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 400,
              color: colors.textPrimary,
              lineHeight: 1.5,
              opacity: 0.92,
            }}
          >
            {interruption.advice}
          </p>
        )}

        {/* Example text (italic, dimmed) */}
        {interruption.example && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontStyle: 'italic',
              color: colors.textSecondary,
              lineHeight: 1.5,
              paddingLeft: 12,
              borderLeft: `2px solid ${colors.border}`,
            }}
          >
            {interruption.example}
          </p>
        )}

        {/* Platform context (small, dimmed) */}
        {interruption.platformContext && (
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: colors.textSecondary,
              lineHeight: 1.45,
              opacity: 0.7,
            }}
          >
            {interruption.platformContext}
          </p>
        )}

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 4,
          }}
        >
          {/* "Got it" -- always shown */}
          <button
            onClick={onAcknowledge}
            onMouseEnter={() => setHoveredButton('acknowledge')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              padding: '8px 18px',
              borderRadius: 10,
              border: 'none',
              background: hoveredButton === 'acknowledge' ? '#5558E0' : colors.primary,
              color: colors.textPrimary,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
            }}
          >
            Got it
          </button>

          {/* "Tell me more" and "Dismiss" -- hidden for positive type */}
          {interruption.type !== 'positive' && (
            <>
              <button
                onClick={onExpand}
                onMouseEnter={() => setHoveredButton('expand')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  border: `1.5px solid ${colors.border}`,
                  background: hoveredButton === 'expand' ? colors.bgCard : 'transparent',
                  color: colors.textPrimary,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
              >
                Tell me more
              </button>

              <button
                onClick={onDismiss}
                onMouseEnter={() => setHoveredButton('dismiss')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'transparent',
                  color: hoveredButton === 'dismiss' ? colors.textPrimary : colors.textSecondary,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
              >
                Dismiss
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

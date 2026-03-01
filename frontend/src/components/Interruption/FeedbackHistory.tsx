import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Target,
  Lightbulb,
  CheckCircle,
  Check,
  ArrowUpRight,
  X,
  Clock,
} from 'lucide-react';
import type { Interruption, InterruptionType, UserResponse } from '../../types';

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

const typeConfig: Record<InterruptionType, { color: string; icon: React.ReactNode }> = {
  critical: { color: colors.critical, icon: <Target size={16} /> },
  suggestion: { color: colors.suggestion, icon: <Lightbulb size={16} /> },
  positive: { color: colors.positive, icon: <CheckCircle size={16} /> },
};

const responseConfig: Record<
  UserResponse,
  { label: string; color: string; icon: React.ReactNode }
> = {
  acknowledged: {
    label: 'Got it',
    color: colors.primary,
    icon: <Check size={12} />,
  },
  expanded: {
    label: 'Expanded',
    color: colors.primary,
    icon: <ArrowUpRight size={12} />,
  },
  dismissed: {
    label: 'Dismissed',
    color: colors.textSecondary,
    icon: <X size={12} />,
  },
  pending: {
    label: 'Pending',
    color: colors.suggestion,
    icon: <Clock size={12} />,
  },
};

function formatTimestamp(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  const hours = d.getHours();
  const mins = d.getMinutes();
  const secs = d.getSeconds();
  return (
    String(hours).padStart(2, '0') +
    ':' +
    String(mins).padStart(2, '0') +
    ':' +
    String(secs).padStart(2, '0')
  );
}

interface FeedbackHistoryProps {
  interruptions: Interruption[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function FeedbackHistory({
  interruptions,
  isOpen,
  onToggle,
}: FeedbackHistoryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      style={{
        background: colors.bgSecondary,
        borderRadius: 14,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Toggle header */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '14px 18px',
          background: 'transparent',
          border: 'none',
          color: colors.textPrimary,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>Feedback History</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: colors.textSecondary,
              background: colors.bgCard,
              padding: '2px 8px',
              borderRadius: 8,
            }}
          >
            {interruptions.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp size={18} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={18} color={colors.textSecondary} />
        )}
      </button>

      {/* Collapsible list */}
      {isOpen && (
        <div
          style={{
            maxHeight: 360,
            overflowY: 'auto',
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          {interruptions.length === 0 && (
            <div
              style={{
                padding: '32px 18px',
                textAlign: 'center',
                color: colors.textSecondary,
                fontSize: 13,
              }}
            >
              No feedback yet. Feedback will appear here as the AI provides it.
            </div>
          )}

          {interruptions.map((item, index) => {
            const tConfig = typeConfig[item.type];
            const rConfig = responseConfig[item.userResponse];
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '14px 18px',
                  background: isHovered ? `${colors.bgCard}60` : 'transparent',
                  borderBottom:
                    index < interruptions.length - 1
                      ? `1px solid ${colors.border}40`
                      : 'none',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Type icon */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${tConfig.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tConfig.color,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {tConfig.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    {/* Timestamp */}
                    <span
                      style={{
                        fontSize: 11,
                        color: colors.textSecondary,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatTimestamp(item.timestamp)}
                    </span>

                    {/* User response badge */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        color: rConfig.color,
                        background: `${rConfig.color}15`,
                        padding: '2px 8px',
                        borderRadius: 6,
                        flexShrink: 0,
                      }}
                    >
                      {rConfig.icon}
                      {rConfig.label}
                    </span>
                  </div>

                  {/* Issue / advice text */}
                  {item.issue && (
                    <p
                      style={{
                        margin: '0 0 2px 0',
                        fontSize: 13,
                        fontWeight: 600,
                        color: colors.textPrimary,
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.issue}
                    </p>
                  )}
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: colors.textSecondary,
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.advice}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

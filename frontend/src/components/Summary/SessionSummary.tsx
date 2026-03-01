import React, { useState } from 'react';
import {
  X,
  Clock,
  Monitor,
  MessageSquare,
  Target,
  Lightbulb,
  CheckCircle,
  Check,
  AlertCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import type { Interruption, InterruptionType } from '../../types';
import FeedbackExport from './FeedbackExport';

const colors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
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
    icon: <Target size={16} />,
    label: 'Critical',
  },
  suggestion: {
    color: colors.suggestion,
    icon: <Lightbulb size={16} />,
    label: 'Suggestion',
  },
  positive: {
    color: colors.positive,
    icon: <CheckCircle size={16} />,
    label: 'Positive',
  },
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

interface SessionSummaryProps {
  duration: number;
  platform: string;
  interruptions: Interruption[];
  summary?: {
    issues_caught: string[];
    issues_fixed: string[];
    final_recommendations: string[];
  };
  onStartNew: () => void;
  onClose: () => void;
}

export default function SessionSummary({
  duration,
  platform,
  interruptions,
  summary,
  onStartNew,
  onClose,
}: SessionSummaryProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  // Build the issues list from interruptions with badge status
  const issueItems = interruptions.map((item) => {
    const wasFixed =
      item.userResponse === 'acknowledged' || item.userResponse === 'expanded';
    return {
      type: item.type,
      text: item.issue || item.advice,
      badge: wasFixed ? 'FIXED' : 'NOTED',
      badgeColor: wasFixed ? colors.positive : colors.suggestion,
    };
  });

  const recommendations = summary?.final_recommendations ?? [];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bgPrimary,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${colors.positive}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle size={24} color={colors.positive} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Session Complete
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  margin: 0,
                  marginTop: 2,
                }}
              >
                Here's your session recap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            onMouseEnter={() => setHoveredButton('close')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: hoveredButton === 'close' ? colors.bgCard : colors.bgSecondary,
              color: colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
          }}
        >
          {/* Duration */}
          <div
            style={{
              padding: '20px 18px',
              borderRadius: 14,
              background: colors.bgSecondary,
              border: `1px solid ${colors.border}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Clock size={18} color={colors.textSecondary} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Duration
              </span>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: colors.textPrimary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatDuration(duration)}
            </div>
          </div>

          {/* Platform */}
          <div
            style={{
              padding: '20px 18px',
              borderRadius: 14,
              background: colors.bgSecondary,
              border: `1px solid ${colors.border}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Monitor size={18} color={colors.textSecondary} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Platform
              </span>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: colors.textPrimary,
              }}
            >
              {platformName}
            </div>
          </div>

          {/* Feedback Count */}
          <div
            style={{
              padding: '20px 18px',
              borderRadius: 14,
              background: colors.bgSecondary,
              border: `1px solid ${colors.border}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <MessageSquare size={18} color={colors.textSecondary} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Feedback
              </span>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: colors.textPrimary,
              }}
            >
              {interruptions.length}
            </div>
          </div>
        </div>

        {/* Issues Caught */}
        {issueItems.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: colors.textPrimary,
                margin: '0 0 14px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={18} color={colors.primary} />
              Issues Caught
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {issueItems.map((item, index) => {
                const cfg = typeConfig[item.type];
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 16px',
                      borderRadius: 12,
                      background: colors.bgSecondary,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${cfg.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: cfg.color,
                        flexShrink: 0,
                      }}
                    >
                      {cfg.icon}
                    </div>
                    <p
                      style={{
                        flex: 1,
                        margin: 0,
                        fontSize: 14,
                        color: colors.textPrimary,
                        lineHeight: 1.45,
                      }}
                    >
                      {item.text}
                    </p>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: item.badgeColor,
                        background: `${item.badgeColor}18`,
                        padding: '4px 10px',
                        borderRadius: 6,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {item.badge === 'FIXED' && <Check size={12} />}
                      {item.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Final Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: colors.textPrimary,
                margin: '0 0 14px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <BookOpen size={18} color={colors.primaryLight} />
              Final Recommendations
            </h2>
            <div
              style={{
                padding: '18px 20px',
                borderRadius: 12,
                background: colors.bgSecondary,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: colors.primaryLight,
                      flexShrink: 0,
                      marginTop: 7,
                    }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: colors.textPrimary,
                      lineHeight: 1.5,
                    }}
                  >
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export panel (toggled) */}
        {showExport && (
          <FeedbackExport
            interruptions={interruptions}
            platform={platform}
            duration={duration}
          />
        )}

        {/* Bottom Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            paddingBottom: 24,
          }}
        >
          <button
            onClick={() => setShowExport((prev) => !prev)}
            onMouseEnter={() => setHoveredButton('save')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '16px 24px',
              borderRadius: 12,
              border: `2px solid ${colors.border}`,
              background: hoveredButton === 'save' ? colors.bgCard : 'transparent',
              color: colors.textPrimary,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
          >
            <BookOpen size={18} />
            Save Notes
          </button>

          <button
            onClick={onStartNew}
            onMouseEnter={() => setHoveredButton('start')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '16px 24px',
              borderRadius: 12,
              border: 'none',
              background:
                hoveredButton === 'start' ? colors.primaryLight : colors.primary,
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
          >
            Start New Session
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import type { Platform } from '../../types';
import { PLATFORMS } from '../../constants/platforms';

const colors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  bgPrimary: '#0F172A',
  bgSecondary: '#1E293B',
  bgCard: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#475569',
  critical: '#EF4444',
  positive: '#10B981',
};

interface PlatformSettingsProps {
  platform: Platform;
}

export default function PlatformSettings({ platform }: PlatformSettingsProps) {
  const config = PLATFORMS[platform];

  if (!config) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        padding: '24px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${colors.primary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Info size={22} color={colors.primary} />
        </div>
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: colors.textPrimary,
              margin: 0,
            }}
          >
            {config.name} Guidelines
          </h2>
          <p
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              margin: '2px 0 0',
            }}
          >
            Ideal length: {config.idealLength}
          </p>
        </div>
      </div>

      {/* Key Rules */}
      <div>
        <h3
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 12px 0',
          }}
        >
          Key Rules
        </h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {config.keyRules.map((rule, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '12px 14px',
                borderRadius: 10,
                background: colors.bgSecondary,
                border: `1px solid ${colors.border}`,
              }}
            >
              <CheckCircle2
                size={18}
                color={colors.positive}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <span
                style={{
                  fontSize: 14,
                  color: colors.textPrimary,
                  lineHeight: 1.45,
                }}
              >
                {rule}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Common Mistakes */}
      <div>
        <h3
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 12px 0',
          }}
        >
          Common Mistakes
        </h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {config.commonMistakes.map((mistake, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '12px 14px',
                borderRadius: 10,
                background: colors.bgSecondary,
                border: `1px solid ${colors.border}`,
              }}
            >
              <XCircle
                size={18}
                color={colors.critical}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <span
                style={{
                  fontSize: 14,
                  color: colors.textPrimary,
                  lineHeight: 1.45,
                }}
              >
                {mistake}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Zap, Scale, Feather, VolumeX } from 'lucide-react';
import type { Intensity } from '../../types';

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

interface IntensitySliderProps {
  value: Intensity;
  onChange: (intensity: Intensity) => void;
}

const options: {
  value: Intensity;
  label: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
  {
    value: 'aggressive',
    label: 'Aggressive',
    description: 'Maximum coaching. The AI interrupts frequently to catch every issue -- pacing, filler words, energy dips, framing, and more. Best for practice sessions.',
    icon: <Zap size={18} />,
    accent: colors.critical,
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Smart interruptions for significant issues only. The AI stays quiet during good moments and speaks up when something important needs attention.',
    icon: <Scale size={18} />,
    accent: colors.primary,
  },
  {
    value: 'light',
    label: 'Light Touch',
    description: 'Minimal interruptions for critical issues only. The AI only speaks up for major problems like dead air, severe framing issues, or critical mistakes.',
    icon: <Feather size={18} />,
    accent: colors.positive,
  },
  {
    value: 'muted',
    label: 'Muted',
    description: 'Silent mode. The AI watches and analyzes but never interrupts. All feedback is saved for the post-session summary. Best for live recordings.',
    icon: <VolumeX size={18} />,
    accent: colors.textSecondary,
  },
];

export default function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const [hoveredValue, setHoveredValue] = useState<Intensity | null>(null);
  const currentOption = options.find((o) => o.value === value);

  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 600,
          color: colors.textPrimary,
          marginBottom: 14,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Feedback Intensity
      </label>

      {/* Segmented Control */}
      <div
        style={{
          display: 'flex',
          background: colors.bgPrimary,
          borderRadius: 12,
          padding: 4,
          gap: 2,
        }}
      >
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const isHovered = hoveredValue === opt.value;

          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              onMouseEnter={() => setHoveredValue(opt.value)}
              onMouseLeave={() => setHoveredValue(null)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                padding: '12px 8px',
                borderRadius: 10,
                border: 'none',
                background: isSelected
                  ? colors.bgCard
                  : isHovered
                    ? `${colors.bgCard}88`
                    : 'transparent',
                color: isSelected ? opt.accent : colors.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: 13,
                fontWeight: isSelected ? 600 : 500,
                fontFamily: 'inherit',
                position: 'relative',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{opt.icon}</span>
              <span>{opt.label}</span>

              {/* Active indicator bar */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    left: '20%',
                    right: '20%',
                    height: 2,
                    borderRadius: 1,
                    background: opt.accent,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Description */}
      {currentOption && (
        <div
          style={{
            marginTop: 16,
            padding: '14px 16px',
            borderRadius: 10,
            background: colors.bgSecondary,
            borderLeft: `3px solid ${currentOption.accent}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span style={{ color: currentOption.accent, display: 'flex', alignItems: 'center' }}>
              {currentOption.icon}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: colors.textPrimary,
              }}
            >
              {currentOption.label}
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {currentOption.description}
          </p>
        </div>
      )}
    </div>
  );
}

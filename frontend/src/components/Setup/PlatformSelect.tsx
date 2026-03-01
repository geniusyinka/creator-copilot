import React, { useState } from 'react';
import { Youtube, Linkedin, Twitter, Music2 } from 'lucide-react';
import type { Platform } from '../../types';

const colors = {
  primary: '#6366F1',
  bgPrimary: '#0F172A',
  bgSecondary: '#1E293B',
  bgCard: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#475569',
};

interface PlatformSelectProps {
  selected: Platform | null;
  onSelect: (platform: Platform) => void;
}

const platforms: {
  id: Platform;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Long-form video, shorts, and live streams',
    icon: <Youtube size={32} />,
    color: '#FF0000',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Short-form vertical video content',
    icon: <Music2 size={32} />,
    color: '#00F2EA',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Professional posts, articles, and video',
    icon: <Linkedin size={32} />,
    color: '#0A66C2',
  },
  {
    id: 'twitter',
    name: 'X / Twitter',
    description: 'Short-form text, threads, and video',
    icon: <Twitter size={32} />,
    color: '#1DA1F2',
  },
];

export default function PlatformSelect({ selected, onSelect }: PlatformSelectProps) {
  const [hoveredId, setHoveredId] = useState<Platform | null>(null);

  return (
    <div>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: colors.textPrimary,
          margin: '0 0 6px 0',
        }}
      >
        Choose Platform
      </h3>
      <p
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          margin: '0 0 20px 0',
        }}
      >
        Select the platform you're creating content for this session.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
        }}
      >
        {platforms.map((p) => {
          const isSelected = selected === p.id;
          const isHovered = hoveredId === p.id;

          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                padding: '24px 16px',
                borderRadius: 14,
                border: `2px solid ${isSelected ? colors.primary : isHovered ? colors.border : 'transparent'}`,
                background: isSelected
                  ? `${colors.primary}15`
                  : isHovered
                    ? colors.bgCard
                    : colors.bgSecondary,
                color: colors.textPrimary,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: isSelected ? `${p.color}22` : `${colors.bgCard}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? p.color : colors.textSecondary,
                  transition: 'all 0.2s ease',
                }}
              >
                {p.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: isSelected ? colors.textPrimary : colors.textPrimary,
                    marginBottom: 4,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    lineHeight: 1.4,
                  }}
                >
                  {p.description}
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: colors.primary,
                    boxShadow: `0 0 8px ${colors.primary}88`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

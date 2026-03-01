import React, { useState } from 'react';
import { Youtube, Linkedin, Twitter, Music2, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import type { Platform } from '../../types';

const colors = {
  primary: '#6366F1',
  bgPrimary: '#0F172A',
  bgSecondary: '#1E293B',
  bgCard: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#475569',
  positive: '#10B981',
};

interface ProfileSetupProps {
  onComplete: () => void;
}

const platformOptions: { id: Platform; label: string; icon: React.ReactNode }[] = [
  { id: 'youtube', label: 'YouTube', icon: <Youtube size={28} /> },
  { id: 'tiktok', label: 'TikTok', icon: <Music2 size={28} /> },
  { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={28} /> },
  { id: 'twitter', label: 'X / Twitter', icon: <Twitter size={28} /> },
];

const styleOptions = [
  'Educational',
  'Entertaining',
  'Inspirational',
  'News/Commentary',
  'Tutorial',
];

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { updateSettings, setHasCompletedSetup } = useSettings();
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [niche, setNiche] = useState('');
  const [style, setStyle] = useState('');
  const [hoveredPlatform, setHoveredPlatform] = useState<Platform | null>(null);
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);
  const [isHoveringContinue, setIsHoveringContinue] = useState(false);

  const togglePlatform = (id: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const canContinue = selectedPlatforms.length > 0 && niche.trim() !== '' && style !== '';

  const handleContinue = () => {
    if (!canContinue) return;
    updateSettings({
      platforms: selectedPlatforms,
      niche: niche.trim(),
      style: style.toLowerCase(),
    });
    setHasCompletedSetup(true);
    onComplete();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.bgPrimary} 0%, #1a1a3e 50%, ${colors.bgPrimary} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${colors.primary}, #818CF8)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={26} color="#fff" />
            </div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: colors.textPrimary,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Creator Copilot
            </h1>
          </div>
          <p
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Real-time AI coaching for content creators. Let's set up your profile.
          </p>
        </div>

        {/* Platform Selection */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Your Platforms
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            {platformOptions.map((p) => {
              const isSelected = selectedPlatforms.includes(p.id);
              const isHovered = hoveredPlatform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  onMouseEnter={() => setHoveredPlatform(p.id)}
                  onMouseLeave={() => setHoveredPlatform(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px 18px',
                    borderRadius: 12,
                    border: `2px solid ${isSelected ? colors.primary : isHovered ? colors.border : 'transparent'}`,
                    background: isSelected
                      ? `${colors.primary}18`
                      : isHovered
                        ? colors.bgCard
                        : colors.bgSecondary,
                    color: isSelected ? colors.primary : colors.textPrimary,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    fontSize: 15,
                    fontWeight: 500,
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {p.icon}
                  </span>
                  <span>{p.label}</span>
                  {isSelected && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={12} color="#fff" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Niche */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Content Niche
          </label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. Tech reviews, Cooking, Personal finance..."
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: colors.bgSecondary,
              color: colors.textPrimary,
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
          />
          <p
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              marginTop: 8,
              margin: '8px 0 0',
            }}
          >
            This helps the AI tailor feedback to your specific content area.
          </p>
        </div>

        {/* Content Style */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Content Style
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {styleOptions.map((s) => {
              const isSelected = style === s;
              const isHovered = hoveredStyle === s;
              return (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  onMouseEnter={() => setHoveredStyle(s)}
                  onMouseLeave={() => setHoveredStyle(null)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 999,
                    border: `2px solid ${isSelected ? colors.primary : 'transparent'}`,
                    background: isSelected
                      ? `${colors.primary}22`
                      : isHovered
                        ? colors.bgCard
                        : colors.bgSecondary,
                    color: isSelected ? colors.primary : colors.textPrimary,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          onMouseEnter={() => setIsHoveringContinue(true)}
          onMouseLeave={() => setIsHoveringContinue(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            padding: '16px 24px',
            borderRadius: 12,
            border: 'none',
            background: canContinue
              ? isHoveringContinue
                ? '#818CF8'
                : colors.primary
              : colors.bgCard,
            color: canContinue ? '#fff' : colors.textSecondary,
            fontSize: 16,
            fontWeight: 600,
            cursor: canContinue ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
            letterSpacing: '0.01em',
          }}
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Volume2, ChevronDown } from 'lucide-react';

const colors = {
  primary: '#6366F1',
  bgPrimary: '#0F172A',
  bgSecondary: '#1E293B',
  bgCard: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#475569',
};

interface VoiceSelectProps {
  value: string;
  onChange: (voiceId: string) => void;
}

const voices = [
  { id: 'en-US-Neural2-F', label: 'Aria (Female, US)', description: 'Warm and professional' },
  { id: 'en-US-Neural2-D', label: 'James (Male, US)', description: 'Clear and authoritative' },
  { id: 'en-US-Neural2-A', label: 'Nova (Female, US)', description: 'Energetic and upbeat' },
  { id: 'en-US-Neural2-J', label: 'Marcus (Male, US)', description: 'Calm and measured' },
  { id: 'en-GB-Neural2-B', label: 'Oliver (Male, UK)', description: 'Polished British accent' },
  { id: 'en-GB-Neural2-A', label: 'Sophie (Female, UK)', description: 'Crisp and articulate' },
];

export default function VoiceSelect({ value, onChange }: VoiceSelectProps) {
  const [isFocused, setIsFocused] = useState(false);
  const selectedVoice = voices.find((v) => v.id === value);

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
        AI Voice
      </label>

      {/* Select Wrapper */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            color: isFocused ? colors.primary : colors.textSecondary,
            pointerEvents: 'none',
            transition: 'color 0.2s ease',
          }}
        >
          <Volume2 size={18} />
        </div>

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            padding: '14px 44px 14px 42px',
            borderRadius: 10,
            border: `1px solid ${isFocused ? colors.primary : colors.border}`,
            background: colors.bgSecondary,
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: 500,
            fontFamily: 'inherit',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            transition: 'border-color 0.2s ease',
            boxSizing: 'border-box',
          }}
        >
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.label}
            </option>
          ))}
        </select>

        <div
          style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            color: colors.textSecondary,
            pointerEvents: 'none',
          }}
        >
          <ChevronDown size={18} />
        </div>
      </div>

      {/* Voice Description */}
      {selectedVoice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 10,
            padding: '10px 14px',
            borderRadius: 8,
            background: colors.bgSecondary,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${colors.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.primary,
              flexShrink: 0,
            }}
          >
            <Volume2 size={16} />
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.textPrimary,
              }}
            >
              {selectedVoice.label}
            </div>
            <div
              style={{
                fontSize: 12,
                color: colors.textSecondary,
              }}
            >
              {selectedVoice.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import AudioWaveform from './AudioWaveform';

const colors = {
  listening: '#10B981',
  processing: '#F59E0B',
  speaking: '#6366F1',
  error: '#EF4444',
  paused: '#94A3B8',
  textPrimary: '#F8FAFC',
};

const statusConfig: Record<
  StatusIndicatorProps['status'],
  { color: string; label: string }
> = {
  listening: { color: colors.listening, label: 'Listening...' },
  processing: { color: colors.processing, label: 'Processing...' },
  speaking: { color: colors.speaking, label: 'Speaking' },
  error: { color: colors.error, label: 'Error' },
  paused: { color: colors.paused, label: 'Paused' },
};

interface StatusIndicatorProps {
  status: 'listening' | 'processing' | 'speaking' | 'error' | 'paused';
  getAnalyser?: () => AnalyserNode | null;
}

export default function StatusIndicator({ status, getAnalyser }: StatusIndicatorProps) {
  const config = statusConfig[status];
  const [pulseVisible, setPulseVisible] = useState(true);
  const isSpeaking = status === 'speaking';

  useEffect(() => {
    if (status !== 'listening') {
      setPulseVisible(true);
      return;
    }

    const interval = setInterval(() => {
      setPulseVisible((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 20,
        background: `${config.color}18`,
        border: `1px solid ${config.color}30`,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Dot or waveform */}
      {isSpeaking && getAnalyser ? (
        <AudioWaveform getAnalyser={getAnalyser} isActive={true} />
      ) : (
        <div
          style={{
            position: 'relative',
            width: 8,
            height: 8,
          }}
        >
          {/* Static dot */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: config.color,
            }}
          />

          {/* Pulse ring for listening state */}
          {status === 'listening' && (
            <div
              style={{
                position: 'absolute',
                top: -4,
                left: -4,
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: `2px solid ${config.color}`,
                opacity: pulseVisible ? 0.6 : 0,
                transform: pulseVisible ? 'scale(1)' : 'scale(0.5)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
              }}
            />
          )}
        </div>
      )}

      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: config.color,
          letterSpacing: '0.01em',
          transition: 'color 0.3s ease',
        }}
      >
        {config.label}
      </span>
    </div>
  );
}

import React from 'react';
import { Settings, Square, Youtube, Linkedin, Twitter, Music2, MessageSquare, Clock } from 'lucide-react';
import type { Platform } from '../../types';
import CameraPreview from './CameraPreview';
import StatusIndicator from './StatusIndicator';
import SessionControls from './SessionControls';

const colors = {
  primary: '#6366F1',
  bgPrimary: '#0F172A',
  bgSecondary: '#1E293B',
  bgCard: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#475569',
  critical: '#EF4444',
  listening: '#10B981',
};

const platformMeta: Record<Platform, { name: string; icon: React.ReactNode }> = {
  youtube: { name: 'YouTube', icon: <Youtube size={16} /> },
  tiktok: { name: 'TikTok', icon: <Music2 size={16} /> },
  linkedin: { name: 'LinkedIn', icon: <Linkedin size={16} /> },
  twitter: { name: 'X / Twitter', icon: <Twitter size={16} /> },
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

interface SessionViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  platform: Platform;
  elapsedTime: number;
  feedbackCount: number;
  isListening: boolean;
  inputMode: 'camera' | 'screen';
  onSwitchToCamera: () => void;
  onSwitchToScreen: () => void;
  onMuteToggle: () => void;
  isMuted: boolean;
  onAskFeedback: () => void;
  onEndSession: () => void;
  onOpenSettings: () => void;
  children?: React.ReactNode;
}

export default function SessionView({
  videoRef,
  platform,
  elapsedTime,
  feedbackCount,
  isListening,
  inputMode,
  onSwitchToCamera,
  onSwitchToScreen,
  onMuteToggle,
  isMuted,
  onAskFeedback,
  onEndSession,
  onOpenSettings,
  children,
}: SessionViewProps) {
  const meta = platformMeta[platform];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: colors.bgPrimary,
        color: colors.textPrimary,
        fontFamily: 'inherit',
      }}
    >
      {/* ---- Top Bar ---- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: `1px solid ${colors.border}`,
          flexShrink: 0,
        }}
      >
        {/* Left: Branding */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: colors.textPrimary,
          }}
        >
          Creator Copilot
        </div>

        {/* Center: Platform + Session badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 20,
              background: colors.bgSecondary,
              border: `1px solid ${colors.border}`,
              fontSize: 13,
              fontWeight: 500,
              color: colors.textPrimary,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', color: colors.primary }}>
              {meta.icon}
            </span>
            <span>{meta.name}</span>
          </div>

          <div
            style={{
              padding: '4px 10px',
              borderRadius: 12,
              background: `${colors.listening}20`,
              border: `1px solid ${colors.listening}40`,
              fontSize: 11,
              fontWeight: 600,
              color: colors.listening,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Live
          </div>
        </div>

        {/* Right: End + Settings */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            onClick={onEndSession}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 10,
              border: `1.5px solid ${colors.critical}`,
              background: `${colors.critical}15`,
              color: colors.critical,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
            }}
          >
            <Square size={14} fill={colors.critical} />
            <span>End</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: colors.bgSecondary,
              color: colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* ---- Main Video Area ---- */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          padding: 16,
          minHeight: 0,
        }}
      >
        <CameraPreview
          videoRef={videoRef}
          isActive={true}
          inputMode={inputMode}
        />

        {/* Children overlay (interruption cards) -- positioned at bottom of video area */}
        {children && (
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 24,
              right: 24,
              zIndex: 10,
              pointerEvents: 'auto',
            }}
          >
            {children}
          </div>
        )}
      </div>

      {/* ---- Bottom Info Bar ---- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 20px',
          flexShrink: 0,
        }}
      >
        {/* Left: Status indicator */}
        <StatusIndicator status={isListening ? 'listening' : 'processing'} />

        {/* Right: Timer + Feedback count */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              fontWeight: 600,
              color: colors.textSecondary,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <Clock size={15} color={colors.textSecondary} />
            <span>{formatTime(elapsedTime)}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              fontWeight: 600,
              color: colors.textSecondary,
            }}
          >
            <MessageSquare size={15} color={colors.textSecondary} />
            <span>{feedbackCount}</span>
          </div>
        </div>
      </div>

      {/* ---- Bottom Controls ---- */}
      <div
        style={{
          padding: '4px 20px 16px',
          borderTop: `1px solid ${colors.border}`,
          flexShrink: 0,
        }}
      >
        <SessionControls
          inputMode={inputMode}
          isMuted={isMuted}
          onSwitchToCamera={onSwitchToCamera}
          onSwitchToScreen={onSwitchToScreen}
          onMuteToggle={onMuteToggle}
          onAskFeedback={onAskFeedback}
        />
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Camera, Monitor, MicOff, Mic, MessageSquare } from 'lucide-react';

const colors = {
  primary: '#6366F1',
  bgPrimary: '#0F172A',
  bgSecondary: '#1E293B',
  bgCard: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#475569',
  critical: '#EF4444',
};

interface SessionControlsProps {
  inputMode: 'camera' | 'screen';
  isMuted: boolean;
  onSwitchToCamera: () => void;
  onSwitchToScreen: () => void;
  onMuteToggle: () => void;
  onAskFeedback: () => void;
}

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isDanger?: boolean;
  isPrimary?: boolean;
  onClick: () => void;
}

function ControlButton({ icon, label, isActive, isDanger, isPrimary, onClick }: ControlButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getBackground = () => {
    if (isPrimary) return isHovered ? '#5558E0' : colors.primary;
    if (isDanger) return isHovered ? '#DC2626' : colors.critical;
    if (isActive) return `${colors.primary}30`;
    return isHovered ? colors.bgCard : colors.bgSecondary;
  };

  const getBorder = () => {
    if (isPrimary || isDanger) return 'transparent';
    if (isActive) return colors.primary;
    return colors.border;
  };

  const getColor = () => {
    if (isPrimary || isDanger) return colors.textPrimary;
    if (isActive) return colors.primary;
    return colors.textSecondary;
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: isPrimary ? '12px 20px' : 12,
        borderRadius: isPrimary ? 12 : 12,
        border: `1.5px solid ${getBorder()}`,
        background: getBackground(),
        color: getColor(),
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600,
        minWidth: isPrimary ? undefined : 48,
        height: 48,
      }}
    >
      {icon}
      {isPrimary && <span>{label}</span>}
    </button>
  );
}

export default function SessionControls({
  inputMode,
  isMuted,
  onSwitchToCamera,
  onSwitchToScreen,
  onMuteToggle,
  onAskFeedback,
}: SessionControlsProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '12px 0',
      }}
    >
      <ControlButton
        icon={<Camera size={20} />}
        label="Camera"
        isActive={inputMode === 'camera'}
        onClick={onSwitchToCamera}
      />

      <ControlButton
        icon={<Monitor size={20} />}
        label="Screen Share"
        isActive={inputMode === 'screen'}
        onClick={onSwitchToScreen}
      />

      <ControlButton
        icon={isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        label={isMuted ? 'Unmute' : 'Mute'}
        isDanger={isMuted}
        onClick={onMuteToggle}
      />

      <ControlButton
        icon={<MessageSquare size={20} />}
        label="Ask for Feedback"
        isPrimary
        onClick={onAskFeedback}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { Camera, Mic, Shield, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const colors = {
  primary: '#6366F1',
  bgPrimary: '#0F172A',
  bgSecondary: '#1E293B',
  bgCard: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#475569',
  positive: '#10B981',
  critical: '#EF4444',
  suggestion: '#F59E0B',
};

interface PermissionsRequestProps {
  onGranted: () => void;
}

interface PermissionStatus {
  camera: 'idle' | 'granted' | 'denied';
  mic: 'idle' | 'granted' | 'denied';
}

const permissions = [
  {
    key: 'camera' as const,
    label: 'Camera',
    icon: <Camera size={24} />,
    reason: 'To capture your video feed and analyze framing, gestures, and visual presentation in real time.',
  },
  {
    key: 'mic' as const,
    label: 'Microphone',
    icon: <Mic size={24} />,
    reason: 'To listen to your content delivery and provide feedback on pacing, energy, and clarity.',
  },
];

export default function PermissionsRequest({ onGranted }: PermissionsRequestProps) {
  const [status, setStatus] = useState<PermissionStatus>({ camera: 'idle', mic: 'idle' });
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHoveringAllow, setIsHoveringAllow] = useState(false);

  const allGranted = status.camera === 'granted' && status.mic === 'granted';
  const hasDenied = status.camera === 'denied' || status.mic === 'denied';

  const requestPermissions = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Stop all tracks immediately -- we just needed to prompt the browser
      stream.getTracks().forEach((track) => track.stop());

      setStatus({ camera: 'granted', mic: 'granted' });

      // Brief delay so the user sees the green checkmarks
      setTimeout(() => {
        onGranted();
      }, 600);
    } catch (err) {
      const mediaError = err as DOMException;
      if (mediaError.name === 'NotAllowedError') {
        setStatus({ camera: 'denied', mic: 'denied' });
        setError('Permissions were denied. Please allow access in your browser settings and try again.');
      } else if (mediaError.name === 'NotFoundError') {
        setError('No camera or microphone found. Please connect a device and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusIcon = (permStatus: 'idle' | 'granted' | 'denied') => {
    switch (permStatus) {
      case 'granted':
        return <CheckCircle2 size={20} color={colors.positive} />;
      case 'denied':
        return <AlertCircle size={20} color={colors.critical} />;
      default:
        return (
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `2px solid ${colors.border}`,
            }}
          />
        );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
        maxWidth: 480,
        margin: '0 auto',
        padding: '40px 24px',
      }}
    >
      {/* Shield Icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: `${colors.primary}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Shield size={36} color={colors.primary} />
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: colors.textPrimary,
            margin: '0 0 8px 0',
          }}
        >
          Permissions Required
        </h2>
        <p
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Creator Copilot needs access to your camera and microphone to provide real-time feedback while you create.
        </p>
      </div>

      {/* Permission Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {permissions.map((perm) => (
          <div
            key={perm.key}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              padding: '18px 20px',
              borderRadius: 12,
              background: colors.bgSecondary,
              border: `1px solid ${
                status[perm.key] === 'granted'
                  ? colors.positive
                  : status[perm.key] === 'denied'
                    ? colors.critical
                    : colors.border
              }`,
              transition: 'border-color 0.2s ease',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: colors.bgCard,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.textPrimary,
                flexShrink: 0,
              }}
            >
              {perm.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: colors.textPrimary,
                  }}
                >
                  {perm.label}
                </span>
                {getStatusIcon(status[perm.key])}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  margin: 0,
                  lineHeight: 1.45,
                }}
              >
                {perm.reason}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 10,
            background: `${colors.critical}15`,
            border: `1px solid ${colors.critical}44`,
            width: '100%',
          }}
        >
          <AlertCircle size={18} color={colors.critical} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: colors.critical, lineHeight: 1.4 }}>{error}</span>
        </div>
      )}

      {/* Allow Button */}
      <button
        onClick={requestPermissions}
        disabled={isRequesting || allGranted}
        onMouseEnter={() => setIsHoveringAllow(true)}
        onMouseLeave={() => setIsHoveringAllow(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          width: '100%',
          padding: '16px 24px',
          borderRadius: 12,
          border: 'none',
          background: allGranted
            ? colors.positive
            : isRequesting
              ? colors.bgCard
              : isHoveringAllow
                ? '#818CF8'
                : colors.primary,
          color: '#fff',
          fontSize: 16,
          fontWeight: 600,
          cursor: isRequesting || allGranted ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
        }}
      >
        {isRequesting ? (
          <>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Requesting Access...
          </>
        ) : allGranted ? (
          <>
            <CheckCircle2 size={18} />
            All Permissions Granted
          </>
        ) : hasDenied ? (
          'Try Again'
        ) : (
          <>
            <Shield size={18} />
            Allow All Permissions
          </>
        )}
      </button>

      {/* Privacy note */}
      <p
        style={{
          fontSize: 12,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 1.5,
          margin: 0,
          opacity: 0.7,
        }}
      >
        Your video and audio are processed locally and sent securely to the AI.
        Nothing is stored or shared.
      </p>

      {/* Inline keyframe animation for the spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

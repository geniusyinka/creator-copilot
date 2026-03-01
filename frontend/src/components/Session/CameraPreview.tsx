import React from 'react';
import { Camera } from 'lucide-react';

const colors = {
  bgSecondary: '#1E293B',
  bgCard: '#334155',
  textSecondary: '#94A3B8',
  border: '#475569',
};

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  inputMode: 'camera' | 'screen';
}

export default function CameraPreview({ videoRef, isActive, inputMode }: CameraPreviewProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        background: colors.bgSecondary,
        border: `1px solid ${colors.border}`,
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: isActive ? 'block' : 'none',
          transform: inputMode === 'camera' ? 'scaleX(-1)' : 'none',
          borderRadius: 16,
        }}
      />

      {/* Placeholder when inactive */}
      {!isActive && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            background: colors.bgCard,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: colors.bgSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Camera size={36} color={colors.textSecondary} />
          </div>
          <span
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              fontWeight: 500,
            }}
          >
            {inputMode === 'camera' ? 'Camera preview' : 'Screen share preview'}
          </span>
        </div>
      )}
    </div>
  );
}

import type { Interruption } from '../../types';
import InterruptionCard from './InterruptionCard';

const colors = {
  primary: '#6366F1',
  bgCard: '#334155',
  textPrimary: '#F8FAFC',
};

interface InterruptionQueueProps {
  activeInterruption: Interruption | null;
  queueCount: number;
  onAcknowledge: () => void;
}

export default function InterruptionQueue({
  activeInterruption,
  queueCount,
  onAcknowledge,
}: InterruptionQueueProps) {
  if (!activeInterruption) return null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Queue count badge */}
      {queueCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: -6,
            zIndex: 2,
            minWidth: 22,
            height: 22,
            borderRadius: 11,
            background: colors.primary,
            color: colors.textPrimary,
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 6px',
            boxShadow: `0 2px 8px rgba(99, 102, 241, 0.4)`,
          }}
        >
          +{queueCount}
        </div>
      )}

      {/* Stacked card shadows behind the active card to hint at depth */}
      {queueCount > 0 && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              right: 6,
              bottom: -4,
              borderRadius: 16,
              background: 'rgba(30, 41, 59, 0.4)',
              border: `1px solid rgba(71, 85, 105, 0.3)`,
              zIndex: -1,
            }}
          />
          {queueCount > 1 && (
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 12,
                right: 12,
                bottom: -8,
                borderRadius: 16,
                background: 'rgba(30, 41, 59, 0.25)',
                border: `1px solid rgba(71, 85, 105, 0.15)`,
                zIndex: -2,
              }}
            />
          )}
        </>
      )}

      {/* Active card */}
      <InterruptionCard
        interruption={{
          type: activeInterruption.type,
          advice: activeInterruption.advice,
        }}
        onAcknowledge={onAcknowledge}
      />
    </div>
  );
}

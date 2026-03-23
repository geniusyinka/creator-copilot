import { useRef, useEffect, useCallback } from 'react';
import type { InterruptionType } from '../../types';

const typeColors: Record<InterruptionType, string> = {
  critical: '#EF4444',
  suggestion: '#F59E0B',
  positive: '#10B981',
};

const SWIPE_THRESHOLD = 60;

interface InterruptionCardProps {
  interruption: {
    type: InterruptionType;
    advice?: string;
  };
  onAcknowledge: () => void;
  onDismiss?: () => void;
}

export default function InterruptionCard({
  interruption,
  onAcknowledge,
  onDismiss,
}: InterruptionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    currentX: 0,
  });

  const barColor = typeColors[interruption.type];

  // Spring entrance animation via Web Animations API
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    el.animate(
      [
        { transform: 'translateY(24px) scale(0.95)', opacity: 0 },
        { transform: 'translateY(-4px) scale(1.01)', opacity: 1, offset: 0.6 },
        { transform: 'translateY(1px) scale(0.998)', opacity: 1, offset: 0.8 },
        { transform: 'translateY(0) scale(1)', opacity: 1 },
      ],
      {
        duration: 450,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards',
      },
    );

    // Pulse the color bar on entrance
    const bar = el.querySelector<HTMLElement>('[data-color-bar]');
    if (bar) {
      bar.animate(
        [
          { boxShadow: `0 0 0px ${barColor}00` },
          { boxShadow: `0 0 12px ${barColor}80` },
          { boxShadow: `0 0 0px ${barColor}00` },
        ],
        { duration: 800, easing: 'ease-out' },
      );
    }
  }, [barColor]);

  // Swipe gesture handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = cardRef.current;
    if (!el) return;
    dragState.current = { isDragging: true, startX: e.clientX, currentX: 0 };
    el.setPointerCapture(e.pointerId);
    el.style.transition = 'none';
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.isDragging) return;
    const el = cardRef.current;
    if (!el) return;

    const dx = e.clientX - dragState.current.startX;
    dragState.current.currentX = dx;

    // Rubber-band effect — diminishing returns past threshold
    const dampened = dx > 0
      ? Math.min(dx, SWIPE_THRESHOLD + Math.sqrt(Math.max(0, dx - SWIPE_THRESHOLD)) * 4)
      : Math.max(dx, -(SWIPE_THRESHOLD + Math.sqrt(Math.max(0, -dx - SWIPE_THRESHOLD)) * 4));

    const progress = Math.min(Math.abs(dx) / SWIPE_THRESHOLD, 1);
    const opacity = 1 - progress * 0.4;

    el.style.transform = `translateX(${dampened}px) rotate(${dampened * 0.02}deg)`;
    el.style.opacity = String(opacity);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.isDragging) return;
    dragState.current.isDragging = false;

    const el = cardRef.current;
    if (!el) return;

    el.releasePointerCapture(e.pointerId);
    const dx = dragState.current.currentX;

    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      // Animate out in swipe direction
      const dir = dx > 0 ? 1 : -1;
      const animation = el.animate(
        [
          { transform: `translateX(${dx}px) rotate(${dx * 0.02}deg)`, opacity: String(1 - Math.min(Math.abs(dx) / SWIPE_THRESHOLD, 1) * 0.4) },
          { transform: `translateX(${dir * 300}px) rotate(${dir * 6}deg)`, opacity: '0' },
        ],
        { duration: 200, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' },
      );
      animation.onfinish = () => {
        if (dir > 0) {
          onAcknowledge(); // swipe right = got it
        } else {
          (onDismiss ?? onAcknowledge)(); // swipe left = dismiss
        }
      };
    } else {
      // Snap back with spring
      el.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease';
      el.style.transform = 'translateX(0) rotate(0deg)';
      el.style.opacity = '1';
    }
  }, [onAcknowledge, onDismiss]);

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    dragState.current.isDragging = false;
    const el = cardRef.current;
    if (!el) return;
    el.releasePointerCapture(e.pointerId);
    el.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease';
    el.style.transform = 'translateX(0) rotate(0deg)';
    el.style.opacity = '1';
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={(e) => {
        // Only fire tap if not swiping
        if (Math.abs(dragState.current.currentX) < 5) {
          onAcknowledge();
        }
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{
        opacity: 0,
        borderRadius: 12,
        overflow: 'hidden',
        background: 'rgba(30, 41, 59, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid #475569',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'row' as const,
        cursor: 'pointer',
        maxWidth: 420,
        touchAction: 'pan-y',
        userSelect: 'none',
        willChange: 'transform, opacity',
      }}
    >
      {/* Thin color bar */}
      <div
        data-color-bar
        style={{
          width: 4,
          flexShrink: 0,
          background: barColor,
          borderRadius: '12px 0 0 12px',
        }}
      />

      {/* Advice text */}
      <p
        style={{
          margin: 0,
          padding: '14px 16px',
          fontSize: 14,
          fontWeight: 400,
          color: '#F8FAFC',
          lineHeight: 1.5,
        }}
      >
        {interruption.advice}
      </p>
    </div>
  );
}

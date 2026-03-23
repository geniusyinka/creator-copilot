import { useRef, useEffect, useCallback } from 'react';

const BAR_COUNT = 24;
const BAR_GAP = 2;
const BAR_WIDTH = 3;
const HEIGHT = 28;
const MIN_BAR_H = 2;
const CANVAS_WIDTH = BAR_COUNT * (BAR_WIDTH + BAR_GAP) - BAR_GAP;

const colors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
};

interface AudioWaveformProps {
  getAnalyser: () => AnalyserNode | null;
  isActive: boolean;
}

export default function AudioWaveform({ getAnalyser, isActive }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const dataRef = useRef<Uint8Array | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = getAnalyser();
    if (!analyser) {
      // Draw idle bars
      ctx.clearRect(0, 0, CANVAS_WIDTH, HEIGHT);
      for (let i = 0; i < BAR_COUNT; i++) {
        const x = i * (BAR_WIDTH + BAR_GAP);
        ctx.fillStyle = `${colors.primary}40`;
        ctx.beginPath();
        ctx.roundRect(x, HEIGHT / 2 - MIN_BAR_H / 2, BAR_WIDTH, MIN_BAR_H, 1);
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }

    analyser.getByteFrequencyData(dataRef.current);

    ctx.clearRect(0, 0, CANVAS_WIDTH, HEIGHT);

    const binCount = dataRef.current.length;
    const binsPerBar = Math.max(1, Math.floor(binCount / BAR_COUNT));

    for (let i = 0; i < BAR_COUNT; i++) {
      // Average a range of frequency bins for this bar
      let sum = 0;
      const startBin = Math.floor(i * binCount / BAR_COUNT);
      for (let b = startBin; b < startBin + binsPerBar && b < binCount; b++) {
        sum += dataRef.current[b];
      }
      const avg = sum / binsPerBar;
      const normalized = avg / 255;

      const barH = Math.max(MIN_BAR_H, normalized * HEIGHT);
      const x = i * (BAR_WIDTH + BAR_GAP);
      const y = (HEIGHT - barH) / 2;

      // Gradient from primary to light based on amplitude
      const alpha = 0.4 + normalized * 0.6;
      const color = normalized > 0.5 ? colors.primaryLight : colors.primary;
      ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.roundRect(x, y, BAR_WIDTH, barH, 1.5);
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [getAnalyser]);

  useEffect(() => {
    if (isActive) {
      rafRef.current = requestAnimationFrame(draw);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, draw]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={HEIGHT}
      style={{
        width: CANVAS_WIDTH,
        height: HEIGHT,
        opacity: isActive ? 1 : 0,
        transition: 'opacity 0.3s ease',
        flexShrink: 0,
      }}
    />
  );
}

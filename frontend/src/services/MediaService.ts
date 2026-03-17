export class MediaService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context');
    }
    this.ctx = ctx;
  }

  async startCamera(): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false, // Audio handled separately by AudioService
    });
    return stream;
  }

  async startScreenShare(): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    return stream;
  }

  stopStream(stream: MediaStream): void {
    for (const track of stream.getTracks()) {
      track.stop();
    }
  }

  captureFrame(video: HTMLVideoElement): string {
    const srcW = video.videoWidth || 640;
    const srcH = video.videoHeight || 480;

    // Downscale for Gemini – 512px wide is plenty for content analysis
    const scale = Math.min(1, 512 / srcW);
    const w = Math.round(srcW * scale);
    const h = Math.round(srcH * scale);

    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.drawImage(video, 0, 0, w, h);

    const dataUrl = this.canvas.toDataURL('image/jpeg', 0.5);
    // Strip the data-URL prefix – server expects raw base64
    return dataUrl.split(',')[1] || '';
  }
}

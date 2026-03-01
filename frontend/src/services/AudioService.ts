export class AudioService {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private audioDataHandler: ((data: string) => void) | null = null;
  private capturing = false;

  async startCapture(): Promise<{ stream: MediaStream; processor: ScriptProcessorNode }> {
    this.audioContext = new AudioContext();
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (event: AudioProcessingEvent) => {
      if (!this.capturing || !this.audioDataHandler) return;

      const inputData = event.inputBuffer.getChannelData(0);
      const pcm16 = this.float32ToPcm16(inputData);
      const base64 = this.arrayBufferToBase64(pcm16.buffer);
      this.audioDataHandler(base64);
    };

    this.sourceNode.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    this.capturing = true;

    return { stream: this.stream, processor: this.processor };
  }

  onAudioData(handler: (data: string) => void): void {
    this.audioDataHandler = handler;
  }

  async playAudio(base64Audio: string): Promise<void> {
    const context = this.audioContext ?? new AudioContext({ sampleRate: 24000 });
    if (!this.audioContext) {
      this.audioContext = context;
    }

    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Gemini native audio returns raw PCM16 at 24kHz mono
    // Convert to Float32 AudioBuffer for playback
    const pcm16 = new Int16Array(bytes.buffer);
    const sampleRate = 24000;
    const audioBuffer = context.createBuffer(1, pcm16.length, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcm16.length; i++) {
      channelData[i] = pcm16[i] / 32768;
    }

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);

    return new Promise<void>((resolve) => {
      source.onended = () => resolve();
      source.start(0);
    });
  }

  playChime(): void {
    const context = this.audioContext ?? new AudioContext();
    if (!this.audioContext) {
      this.audioContext = context;
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.setValueAtTime(1100, context.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);
  }

  stopCapture(): void {
    this.capturing = false;

    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.audioDataHandler = null;
  }

  isCapturing(): boolean {
    return this.capturing;
  }

  private float32ToPcm16(float32Array: Float32Array): Int16Array {
    const pcm16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return pcm16;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

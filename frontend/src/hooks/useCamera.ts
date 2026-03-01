import { useState, useRef, useCallback, useEffect } from 'react';
import { MediaService } from '../services/MediaService';

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaServiceRef = useRef<MediaService>(new MediaService());

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await mediaServiceRef.current.startCamera();
      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      throw error;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      mediaServiceRef.current.stopStream(stream);
      setStream(null);
      setIsActive(false);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  // Attach stream to video element when videoRef becomes available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        mediaServiceRef.current.stopStream(stream);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { stream, isActive, startCamera, stopCamera, videoRef };
}

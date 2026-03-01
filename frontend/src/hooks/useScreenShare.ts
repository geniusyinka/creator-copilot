import { useState, useRef, useCallback, useEffect } from 'react';
import { MediaService } from '../services/MediaService';

export function useScreenShare() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaServiceRef = useRef<MediaService>(new MediaService());

  const startScreenShare = useCallback(async () => {
    try {
      const mediaStream = await mediaServiceRef.current.startScreenShare();
      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Handle the case where the user stops sharing via the browser UI
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setStream(null);
          setIsActive(false);
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        };
      }
    } catch (error) {
      console.error('Failed to start screen share:', error);
      throw error;
    }
  }, []);

  const stopScreenShare = useCallback(() => {
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

  return { stream, isActive, startScreenShare, stopScreenShare, videoRef };
}

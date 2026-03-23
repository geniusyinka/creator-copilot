import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from './context/SessionContext';
import { useSettings } from './context/SettingsContext';
import ProfileSetup from './components/Setup/ProfileSetup';
import PlatformSelect from './components/Setup/PlatformSelect';
import PermissionsRequest from './components/Setup/PermissionsRequest';
import SessionView from './components/Session/SessionView';
import InterruptionCard from './components/Interruption/InterruptionCard';
import FeedbackHistory from './components/Interruption/FeedbackHistory';
import SessionSummary from './components/Summary/SessionSummary';
import IntensitySlider from './components/Settings/IntensitySlider';
import { useWebSocket } from './hooks/useWebSocket';
import { useCamera } from './hooks/useCamera';
import { useScreenShare } from './hooks/useScreenShare';
import { useMicrophone } from './hooks/useMicrophone';
import { useInterruption } from './hooks/useInterruption';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { MediaService } from './services/MediaService';
import type { Platform, Intensity, SessionSummaryData } from './types';
import { ArrowRight, Sparkles } from 'lucide-react';

const colors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  bgPrimary: '#0F172A',
  bgSecondary: '#1E293B',
  bgCard: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#475569',
  critical: '#EF4444',
  suggestion: '#F59E0B',
  positive: '#10B981',
};

type AppStep =
  | 'profile'
  | 'platform-select'
  | 'permissions'
  | 'active'
  | 'summary';

function AppContent() {
  const { dispatch } = useSession();
  const { settings, hasCompletedSetup } = useSettings();

  // Determine initial step based on whether setup is done
  const [step, setStep] = useState<AppStep>(() =>
    hasCompletedSetup ? 'platform-select' : 'profile',
  );

  // Session configuration state
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [intensity, setIntensity] = useState<Intensity>(settings.intensity);
  const [contentDescription, setContentDescription] = useState('');
  const [inputMode, setInputMode] = useState<'camera' | 'screen'>('camera');
  const [isMuted, setIsMuted] = useState(false);
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(null);
  const [isHoveringStart, setIsHoveringStart] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);

  // Hooks
  const { isConnected, lastMessage, connect, disconnect, send } = useWebSocket();
  const { startCamera, stopCamera, videoRef: cameraVideoRef } = useCamera();
  const { startScreenShare, stopScreenShare, videoRef: screenVideoRef } = useScreenShare();
  const { isActive: micActive, startMicrophone, stopMicrophone, onAudioData } = useMicrophone();
  const {
    interruptions,
    activeInterruption,
    showHistory,
    addInterruption,
    acknowledgeInterruption,
    toggleHistory,
    dismissInterruption,
  } = useInterruption();
  const { playAudio, playChime, isPlaying: isAudioPlaying, getAnalyser } = useAudioPlayer();

  // Refs for cleanup
  const mediaServiceRef = useRef<MediaService>(new MediaService());
  const frameIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const endSessionTimeoutRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // The active video ref depends on input mode
  const activeVideoRef = inputMode === 'camera' ? cameraVideoRef : screenVideoRef;

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'interruption': {
        addInterruption(lastMessage.content);
        if (lastMessage.audio) {
          playAudio(lastMessage.audio);
        } else {
          playChime();
        }
        break;
      }
      case 'summary': {
        setSummaryData(lastMessage.data);
        if (endSessionTimeoutRef.current) {
          clearTimeout(endSessionTimeoutRef.current);
          endSessionTimeoutRef.current = null;
        }
        if (isEndingSession) {
          disconnect();
          setIsEndingSession(false);
          setStep('summary');
        }
        break;
      }
      case 'error': {
        console.error('WebSocket error:', lastMessage.message);
        break;
      }
      case 'status': {
        // Server status updates -- currently no-op
        break;
      }
    }
  }, [lastMessage, playChime, addInterruption, playAudio, disconnect, isEndingSession]);

  useEffect(() => {
    if (!isEndingSession || isConnected) return;

    if (endSessionTimeoutRef.current) {
      clearTimeout(endSessionTimeoutRef.current);
      endSessionTimeoutRef.current = null;
    }
    setIsEndingSession(false);
    setStep('summary');
  }, [isConnected, isEndingSession]);

  // Start capturing frames and sending them over WebSocket
  const startFrameCapture = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }

    frameIntervalRef.current = window.setInterval(() => {
      const videoEl = activeVideoRef.current;
      if (!videoEl || videoEl.readyState < 2) return;

      try {
        const frameData = mediaServiceRef.current.captureFrame(videoEl);
        send({ type: 'video_frame', data: frameData });
      } catch (err) {
        // Silently skip frame if capture fails
      }
    }, 1000); // ~1 FPS for Gemini analysis
  }, [activeVideoRef, send]);

  // Stop frame capture
  const stopFrameCapture = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  }, []);

  // Start the elapsed timer
  const startTimer = useCallback(() => {
    elapsedRef.current = 0;
    setElapsedTime(0);

    timerIntervalRef.current = window.setInterval(() => {
      elapsedRef.current += 1;
      setElapsedTime(elapsedRef.current);
      dispatch({ type: 'UPDATE_ELAPSED', seconds: elapsedRef.current });
    }, 1000);
  }, [dispatch]);

  // Stop the elapsed timer
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Main session start logic
  const startSession = useCallback(async () => {
    if (!selectedPlatform) return;

    // Move to permissions first
    setStep('permissions');
  }, [selectedPlatform]);

  // Called after permissions are granted – fully sequential to avoid race conditions
  const onPermissionsGranted = useCallback(async () => {
    if (!selectedPlatform) return;

    setStep('active');

    // Dispatch to context
    dispatch({
      type: 'START_SESSION',
      platform: selectedPlatform,
      description: contentDescription || undefined,
      intensity,
      inputMode,
    });

    try {
      // 1. Connect WebSocket and send config FIRST
      await connect();
      send({
        type: 'config',
        platform: selectedPlatform,
        intensity,
        description: contentDescription || undefined,
      });

      // 2. Start media capture
      try {
        if (inputMode === 'camera') {
          await startCamera();
        } else {
          await startScreenShare();
        }
      } catch (err) {
        console.error('Failed to start video capture:', err);
      }

      try {
        await startMicrophone();
      } catch (err) {
        console.error('Failed to start microphone:', err);
      }

      // 3. Wire up audio forwarding and frame capture AFTER config sent
      onAudioData((data: string) => {
        send({ type: 'audio_chunk', data });
      });
      startFrameCapture();
      startTimer();
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  }, [selectedPlatform, contentDescription, intensity, inputMode, dispatch, connect, send, startCamera, startScreenShare, startMicrophone, onAudioData, startFrameCapture, startTimer]);

  // End the session
  const endSession = useCallback(() => {
    if (isEndingSession) return;

    setIsEndingSession(true);

    // Send end message to server
    send({ type: 'end_session' });

    // Stop all media
    stopFrameCapture();
    stopTimer();
    stopCamera();
    stopScreenShare();
    stopMicrophone();
    disconnect();

    // Update context
    dispatch({ type: 'END_SESSION' });

    // Fallback in case the socket closes or the summary never arrives
    endSessionTimeoutRef.current = window.setTimeout(() => {
      disconnect();
      setIsEndingSession(false);
      setStep('summary');
      endSessionTimeoutRef.current = null;
    }, 1500);
  }, [
    isEndingSession,
    send,
    stopFrameCapture,
    stopTimer,
    stopCamera,
    stopScreenShare,
    stopMicrophone,
    disconnect,
    dispatch,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopFrameCapture();
      stopTimer();
      if (endSessionTimeoutRef.current) {
        clearTimeout(endSessionTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch to camera
  const switchToCamera = useCallback(async () => {
    if (inputMode === 'camera') return;
    stopFrameCapture();
    stopScreenShare();
    setInputMode('camera');
    try {
      await startCamera();
    } catch (err) {
      console.error('Failed to switch to camera:', err);
    }
    startFrameCapture();
  }, [inputMode, stopFrameCapture, stopScreenShare, startCamera, startFrameCapture]);

  // Switch to screen share
  const switchToScreen = useCallback(async () => {
    if (inputMode === 'screen') return;
    stopFrameCapture();
    stopCamera();
    setInputMode('screen');
    try {
      await startScreenShare();
    } catch (err) {
      console.error('Failed to switch to screen:', err);
    }
    startFrameCapture();
  }, [inputMode, stopFrameCapture, stopCamera, startScreenShare, startFrameCapture]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (isMuted) {
      startMicrophone().catch(console.error);
      setIsMuted(false);
    } else {
      stopMicrophone();
      setIsMuted(true);
    }
  }, [isMuted, startMicrophone, stopMicrophone]);

  // Ask for manual feedback
  const askFeedback = useCallback(() => {
    send({ type: 'manual_check' });
  }, [send]);

  // Start a new session from the summary screen
  const handleStartNew = useCallback(() => {
    setSelectedPlatform(null);
    setContentDescription('');
    setIntensity(settings.intensity);
    setSummaryData(null);
    setIsEndingSession(false);
    setElapsedTime(0);
    elapsedRef.current = 0;
    setStep('platform-select');
  }, [settings.intensity]);

  // Render based on step
  switch (step) {
    case 'profile':
      return <ProfileSetup onComplete={() => setStep('platform-select')} />;

    case 'permissions':
      return (
        <div
          style={{
            minHeight: '100vh',
            background: colors.bgPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PermissionsRequest onGranted={onPermissionsGranted} />
        </div>
      );

    case 'platform-select':
      return (
        <div
          style={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${colors.bgPrimary} 0%, #1a1a3e 50%, ${colors.bgPrimary} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 600,
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={22} color="#fff" />
                </div>
                <h1
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: colors.textPrimary,
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  New Session
                </h1>
              </div>
              <p
                style={{
                  fontSize: 15,
                  color: colors.textSecondary,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Configure your session and start creating with real-time AI feedback.
              </p>
            </div>

            {/* Platform Select */}
            <PlatformSelect
              selected={selectedPlatform}
              onSelect={setSelectedPlatform}
            />

            {/* Content Description */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.textPrimary,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Content Description
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: colors.textSecondary,
                    textTransform: 'none',
                    letterSpacing: 'normal',
                    marginLeft: 8,
                  }}
                >
                  (optional)
                </span>
              </label>
              <textarea
                value={contentDescription}
                onChange={(e) => setContentDescription(e.target.value)}
                placeholder="Briefly describe what you're creating, e.g. 'Product review of the new iPhone' or 'How-to guide for meal prepping'..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: `1px solid ${colors.border}`,
                  background: colors.bgSecondary,
                  color: colors.textPrimary,
                  fontSize: 14,
                  lineHeight: 1.5,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              />
              <p
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  margin: '6px 0 0',
                }}
              >
                Helps the AI tailor feedback to your specific content.
              </p>
            </div>

            {/* Intensity Slider */}
            <IntensitySlider value={intensity} onChange={setIntensity} />

            {/* Start Session Button */}
            <button
              onClick={startSession}
              disabled={!selectedPlatform}
              onMouseEnter={() => setIsHoveringStart(true)}
              onMouseLeave={() => setIsHoveringStart(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                width: '100%',
                padding: '18px 24px',
                borderRadius: 14,
                border: 'none',
                background: selectedPlatform
                  ? isHoveringStart
                    ? colors.primaryLight
                    : colors.primary
                  : colors.bgCard,
                color: selectedPlatform ? '#fff' : colors.textSecondary,
                fontSize: 17,
                fontWeight: 700,
                cursor: selectedPlatform ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                letterSpacing: '0.01em',
                boxShadow: selectedPlatform
                  ? `0 4px 20px ${colors.primary}40`
                  : 'none',
              }}
            >
              Start Session
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      );

    case 'active':
      return (
        <>
          <SessionView
            videoRef={activeVideoRef}
            platform={selectedPlatform!}
            elapsedTime={elapsedTime}
            feedbackCount={interruptions.length}
            isListening={micActive && !isMuted}
            isSpeaking={isAudioPlaying}
            getAnalyser={getAnalyser}
            inputMode={inputMode}
            onSwitchToCamera={switchToCamera}
            onSwitchToScreen={switchToScreen}
            onMuteToggle={toggleMute}
            isMuted={isMuted}
            onAskFeedback={askFeedback}
            onEndSession={endSession}
            onOpenSettings={toggleHistory}
          >
            {activeInterruption && (
              <InterruptionCard
                interruption={activeInterruption}
                onAcknowledge={acknowledgeInterruption}
                onDismiss={dismissInterruption}
              />
            )}
          </SessionView>

          {/* Feedback history overlay */}
          {showHistory && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 380,
                maxWidth: '100vw',
                background: colors.bgPrimary,
                borderLeft: `1px solid ${colors.border}`,
                zIndex: 50,
                overflowY: 'auto',
                padding: 16,
                boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              <FeedbackHistory
                interruptions={interruptions}
                isOpen={true}
                onToggle={toggleHistory}
              />
            </div>
          )}
        </>
      );

    case 'summary':
      return (
        <SessionSummary
          duration={elapsedTime}
          platform={selectedPlatform || 'youtube'}
          interruptions={interruptions}
          summary={
            summaryData
              ? {
                  issues_caught: summaryData.issues_caught,
                  issues_fixed: summaryData.issues_fixed,
                  final_recommendations: summaryData.final_recommendations,
                }
              : undefined
          }
          onStartNew={handleStartNew}
          onClose={handleStartNew}
        />
      );

    default:
      return null;
  }
}

export default function App() {
  return <AppContent />;
}

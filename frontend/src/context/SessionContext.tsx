import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Session, SessionStatus, Platform, Intensity, InputMode, Interruption } from '../types';

interface SessionState {
  session: Session | null;
  status: SessionStatus;
  elapsedTime: number; // seconds
  feedbackCount: number;
}

type SessionAction =
  | { type: 'START_SESSION'; platform: Platform; description?: string; intensity: Intensity; inputMode: InputMode }
  | { type: 'END_SESSION' }
  | { type: 'PAUSE_SESSION' }
  | { type: 'RESUME_SESSION' }
  | { type: 'ADD_INTERRUPTION'; interruption: Interruption }
  | { type: 'UPDATE_ELAPSED'; seconds: number }
  | { type: 'UPDATE_SETTINGS'; intensity?: Intensity; inputMode?: InputMode };

const initialState: SessionState = {
  session: null,
  status: 'setup',
  elapsedTime: 0,
  feedbackCount: 0,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        status: 'active',
        session: {
          id: crypto.randomUUID(),
          startedAt: new Date(),
          platform: action.platform,
          contentDescription: action.description,
          settings: {
            intensity: action.intensity,
            voiceId: 'en-US-Neural2-F',
            inputMode: action.inputMode,
          },
          interruptions: [],
          status: 'active',
        },
        elapsedTime: 0,
        feedbackCount: 0,
      };
    case 'END_SESSION':
      return {
        ...state,
        status: 'ended',
        session: state.session ? { ...state.session, endedAt: new Date(), status: 'ended' } : null,
      };
    case 'PAUSE_SESSION':
      return { ...state, status: 'paused' };
    case 'RESUME_SESSION':
      return { ...state, status: 'active' };
    case 'ADD_INTERRUPTION':
      return {
        ...state,
        feedbackCount: state.feedbackCount + 1,
        session: state.session
          ? { ...state.session, interruptions: [...state.session.interruptions, action.interruption] }
          : null,
      };
    case 'UPDATE_ELAPSED':
      return { ...state, elapsedTime: action.seconds };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        session: state.session
          ? {
              ...state.session,
              settings: {
                ...state.session.settings,
                ...(action.intensity && { intensity: action.intensity }),
                ...(action.inputMode && { inputMode: action.inputMode }),
              },
            }
          : null,
      };
    default:
      return state;
  }
}

const SessionContext = createContext<{
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
} | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}

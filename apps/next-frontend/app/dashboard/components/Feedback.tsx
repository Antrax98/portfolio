'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Alert, Snackbar, type AlertColor } from '@mui/material';

type Notify = (message: string, severity?: AlertColor) => void;

const FeedbackContext = createContext<Notify | null>(null);

export function useFeedback(): Notify {
  const notify = useContext(FeedbackContext);

  if (!notify) {
    throw new Error('useFeedback() fuera de <FeedbackProvider>');
  }

  return notify;
}

interface Message {
  text: string;
  severity: AlertColor;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<Message | null>(null);

  const notify = useCallback<Notify>((text, severity = 'success') => {
    setMessage({ text, severity });
  }, []);

  // Sin useMemo, cada render daría una identidad nueva y re-renderizaría todo
  // lo que consume el contexto.
  const value = useMemo(() => notify, [notify]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <Snackbar
        open={message !== null}
        autoHideDuration={4000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {message ? (
          <Alert
            severity={message.severity}
            variant="filled"
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        ) : undefined}
      </Snackbar>
    </FeedbackContext.Provider>
  );
}

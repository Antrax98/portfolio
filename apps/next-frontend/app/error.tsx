'use client';

import { Alert, Button, Container } from '@mui/material';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={reset}>
            Reintentar
          </Button>
        }
      >
        No se pudo cargar el portafolio.
      </Alert>
    </Container>
  );
}

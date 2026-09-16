'use client';

import { useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { authApi } from '@/lib/api/client/auth';
import { fieldErrorsOf, type FieldErrors } from '@/lib/api/apiError';
import { errorMessage } from '@/lib/errors';

const MIN_PASSWORD = 8;
// La misma forma que valida el dominio en el backend. Se repite aquí a
// propósito: el servidor sigue siendo el que manda, pero avisar al escribir
// evita gastar el único registro disponible en un error de tecleo.
const USERNAME_SHAPE = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

export function SetupForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState('');
  const [fields, setFields] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  // La repetición no existe en el backend: es cosa del formulario y se comprueba
  // aquí para no gastar una petición en el único endpoint que solo funciona una
  // vez.
  const mismatch = repeat.length > 0 && password !== repeat;
  const badUsername = username.length > 0 && !USERNAME_SHAPE.test(username);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setFields({});

    if (password !== repeat) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!USERNAME_SHAPE.test(username)) {
      setError('El nombre de usuario no tiene un formato válido.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({ username, email, password });
    } catch (err) {
      setError(errorMessage(err));
      setFields(fieldErrorsOf(err));
      setLoading(false);
      return;
    }

    // La cuenta ya existe. Si el login fallara ahora, volver a registrar daría
    // 409 para siempre, así que el formulario no puede volver a mostrarse:
    // mandamos a /login, que es el único camino que queda.
    try {
      await authApi.login({ identifier: email, password });
      router.push('/dashboard');
      router.refresh();
    } catch {
      router.push('/login');
    }
  }

  return (
    <Container
      maxWidth="xs"
      sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
          Crear la cuenta
        </Typography>

        <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
          Este portafolio todavía no tiene dueño. La cuenta que crees aquí será
          la única: el registro se cierra en cuanto exista.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={badUsername || Boolean(fields.username)}
              helperText={
                badUsername
                  ? 'Sin espacios: solo letras, números, guiones y guion bajo.'
                  : (fields.username ??
                    'Con esto entras al panel. El nombre que se ve en el portafolio se cambia después.')
              }
              autoComplete="username"
              required
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(fields.email)}
              helperText={fields.email}
              autoComplete="email"
              required
              fullWidth
            />

            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(fields.password)}
              helperText={
                fields.password ?? `Mínimo ${MIN_PASSWORD} caracteres.`
              }
              autoComplete="new-password"
              required
              fullWidth
            />

            <TextField
              label="Repetir contraseña"
              type="password"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              error={mismatch}
              helperText={mismatch ? 'No coincide con la anterior.' : ' '}
              autoComplete="new-password"
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || mismatch || badUsername}
            >
              {loading ? 'Creando...' : 'Crear cuenta y entrar'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

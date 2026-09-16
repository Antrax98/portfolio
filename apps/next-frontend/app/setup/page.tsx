import { Container, Stack, Typography } from '@mui/material';

export default function SetupPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Portafolio sin configurar
        </Typography>

        <Typography color="text.secondary">
          Todavía no hay ninguna cuenta. Crea la primera con{' '}
          <code>POST /auth/register</code> y vuelve a cargar esta página.
        </Typography>

        <Typography variant="body2" color="text.secondary">
          El registro se cierra solo en cuanto exista una credencial.
        </Typography>
      </Stack>
    </Container>
  );
}

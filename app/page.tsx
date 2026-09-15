import { Button, Container, Stack, Typography } from '@mui/material';

export default function LandingPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Portafolio
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Aquí irá la presentación y las tarjetas de los proyectos, con los
          datos de <code>GET /portfolio</code>.
        </Typography>

        <Button href="/login" variant="outlined" size="small">
          Entrar
        </Button>
      </Stack>
    </Container>
  );
}

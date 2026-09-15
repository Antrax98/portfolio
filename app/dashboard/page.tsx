'use client';

import { useRouter } from 'next/navigation';
import { Button, Container, Stack, Typography } from '@mui/material';
import { authApi } from '@/lib/api/auth';

export default function DashboardPage() {
  const router = useRouter();

  async function handleLogout() {
    await authApi.logout();
    router.replace('/login');
    router.refresh();
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h4">Panel</Typography>
        <Button onClick={handleLogout} variant="outlined">
          Cerrar sesión
        </Button>
      </Stack>
    </Container>
  );
}

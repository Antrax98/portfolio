'use client';

import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { authApi } from '@/lib/api/client/auth';

const DISCREET = {
  color: 'text.disabled',
  '&:hover': { color: 'text.secondary' },
} as const;

export function OwnerBar({ authenticated }: { authenticated: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await authApi.logout();
    router.refresh();
  }

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
    >
      {authenticated ? (
        <>
          <Tooltip title="Editar">
            <IconButton
              href="/dashboard"
              aria-label="Editar el portafolio"
              size="small"
              sx={DISCREET}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cerrar sesión">
            <IconButton
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              size="small"
              sx={DISCREET}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <Tooltip title="Iniciar sesión">
          <IconButton
            href="/login"
            aria-label="Iniciar sesión"
            size="small"
            sx={DISCREET}
          >
            <LoginIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

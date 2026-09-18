import { redirect } from 'next/navigation';
import { Box, Container, Stack, Typography } from '@mui/material';
import { getPortfolio } from '@/lib/api/server/portfolio';
import { hasSession } from '@/lib/api/server/session';
import { OwnerBar } from './_components/OwnerBar';
import { ProfileHeader } from './_components/ProfileHeader';
import { ProjectCarousel } from './_components/ProjectCarousel';

export default async function LandingPage() {
  const [portfolio, authenticated] = await Promise.all([
    getPortfolio(),
    hasSession(),
  ]);

  if (!portfolio) redirect('/setup');

  return (
    <Box sx={{ position: 'relative' }}>
      <OwnerBar authenticated={authenticated} />

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={6}>
          <ProfileHeader
            profile={portfolio.profile}
            username={portfolio.username}
          />

          {portfolio.projects.total === 0 ? (
            <Stack spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Proyectos
              </Typography>
              <Typography color="text.secondary">
                Todavía no hay proyectos publicados.
              </Typography>
            </Stack>
          ) : (
            <ProjectCarousel
              initial={portfolio.projects.items}
              total={portfolio.projects.total}
              size={portfolio.projects.size}
            />
          )}
        </Stack>
      </Container>
    </Box>
  );
}

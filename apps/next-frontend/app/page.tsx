import { redirect } from 'next/navigation';
import { Box, Container, Stack, Typography } from '@mui/material';
import { getPortfolio } from '@/lib/api/server/portfolio';
import { hasSession } from '@/lib/api/server/session';
import { OwnerBar } from './components/OwnerBar';
import { ProfileHeader } from './components/ProfileHeader';
import { ProjectCard } from './components/ProjectCard';

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

          <Stack spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Proyectos
            </Typography>

            {portfolio.projects.length === 0 ? (
              <Typography color="text.secondary">
                Todavía no hay proyectos publicados.
              </Typography>
            ) : (
              portfolio.projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

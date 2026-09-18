'use client';

import { useRouter } from 'next/navigation';
import LogoutIcon from '@mui/icons-material/Logout';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button, Container, Stack, Typography } from '@mui/material';
import { authApi } from '@/lib/api/client/auth';
import type { Profile, Project } from '@/lib/api/schemas';
import { ProjectTabs } from '@/app/_components/ProjectTabs';
import { FeedbackProvider } from './_components/Feedback';
import { ProfileForm } from './_profile/ProfileForm';
import { ProjectsPanel } from './_projects/ProjectsPanel';

interface Props {
  profile: Profile;
  projects: Project[];
}

export function DashboardPanel({ profile, projects }: Props) {
  const router = useRouter();

  async function handleLogout() {
    await authApi.logout();
    router.replace('/login');
    router.refresh();
  }

  return (
    <FeedbackProvider>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Panel
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button
                href="/"
                startIcon={<VisibilityIcon />}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                Ver portafolio
              </Button>

              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                Salir
              </Button>
            </Stack>
          </Stack>

          <ProjectTabs
            keepMounted
            tabs={[
              {
                label: 'Perfil',
                content: <ProfileForm profile={profile} />,
              },
              {
                label: `Proyectos (${projects.length})`,
                content: <ProjectsPanel projects={projects} />,
              },
            ]}
          />
        </Stack>
      </Container>
    </FeedbackProvider>
  );
}

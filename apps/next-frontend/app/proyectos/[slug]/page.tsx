import { notFound } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { getPortfolio } from '@/lib/api/server/portfolio';
import { hasSession } from '@/lib/api/server/session';
import { OwnerBar } from '@/app/components/OwnerBar';
import { assetsOf, LINK_KINDS } from '@/lib/assets';
import { lookFor } from '@/app/components/AssetIcon';
import { Markdown } from '@/app/components/Markdown';
import { ProjectGallery } from '@/app/components/ProjectGallery';
import { ProjectTabs, type ProjectTab } from '@/app/components/ProjectTabs';
import { VideoPlayer } from '@/app/components/VideoPlayer';

export default async function ProjectDetailPage({
  params,
}: PageProps<'/proyectos/[slug]'>) {
  const { slug } = await params;

  const [portfolio, authenticated] = await Promise.all([
    getPortfolio(),
    hasSession(),
  ]);
  const project = portfolio?.projects.find((p) => p.slug === slug);

  if (!project) notFound();

  const links = assetsOf(project.assets, ...LINK_KINDS);
  const images = assetsOf(project.assets, 'image');
  const videos = assetsOf(project.assets, 'video');

  const tabs: ProjectTab[] = [];

  if (project.description) {
    tabs.push({
      label: 'Descripción',
      content: <Markdown>{project.description}</Markdown>,
    });
  }

  if (images.length > 0) {
    tabs.push({
      label: `Imágenes (${images.length})`,
      content: <ProjectGallery images={images} />,
    });
  }

  if (videos.length > 0) {
    tabs.push({
      label: videos.length > 1 ? `Videos (${videos.length})` : 'Video',
      content: (
        <Stack spacing={3}>
          {videos.map((video) => (
            <VideoPlayer key={video.url} asset={video} />
          ))}
        </Stack>
      ),
    });
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <OwnerBar authenticated={authenticated} />

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={3}>
          <Button
            href="/"
            startIcon={<ArrowBackIcon />}
            size="small"
            sx={{ alignSelf: 'flex-start', ml: -1, color: 'text.secondary' }}
          >
            Volver
          </Button>

          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {project.title}
          </Typography>

          {links.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: 'wrap', gap: 1 }}
            >
              {links.map((asset) => {
                const { icon: Icon, label } = lookFor(asset);
                return (
                  <Button
                    key={asset.url}
                    variant="outlined"
                    size="small"
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<Icon />}
                  >
                    {label}
                  </Button>
                );
              })}
            </Stack>
          )}

          <Divider />

          <ProjectTabs tabs={tabs} />
        </Stack>
      </Container>
    </Box>
  );
}

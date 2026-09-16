import Link from 'next/link';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { Project } from '@/lib/api/schemas';
import { assetsOf, excerpt } from '@/lib/assets';

export function ProjectCard({ project }: { project: Project }) {
  const [cover] = assetsOf(project.assets, 'image');
  const summary = excerpt(project.description);

  return (
    <Link
      href={`/proyectos/${project.slug}`}
      style={{ color: 'inherit', textDecoration: 'none' }}
    >
      <Card
        variant="outlined"
        sx={{ '&:hover .project-title': { color: 'primary.main' } }}
      >
        {cover && (
          <Box
            component="img"
            src={cover.url}
            alt=""
            loading="lazy"
            sx={{
              width: '100%',
              height: 180,
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}

        <CardContent>
          <Stack spacing={1}>
            <Typography
              variant="h6"
              className="project-title"
              sx={{ fontWeight: 600, transition: 'color 160ms ease' }}
            >
              {project.title}
            </Typography>

            {summary && (
              <Typography variant="body2" color="text.secondary">
                {summary}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
}

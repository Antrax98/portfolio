import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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
        sx={{
          '&:hover .project-title': { color: 'primary.main' },
          // La flecha se mueve y se tiñe con el mismo hover del título: el
          // objetivo del clic es la tarjeta entera, no la flecha.
          '&:hover .project-arrow': {
            color: 'primary.main',
            transform: 'translateX(4px)',
          },
        }}
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
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography
                variant="h6"
                className="project-title"
                sx={{
                  fontWeight: 600,
                  transition: 'color 160ms ease',
                  flexGrow: 1,
                }}
              >
                {project.title}
              </Typography>

              {/* Decorativa: la tarjeta ya es un enlace y se anuncia como tal,
                  así que el icono va oculto para los lectores de pantalla. */}
              <ArrowForwardIcon
                className="project-arrow"
                aria-hidden
                fontSize="small"
                sx={{
                  flexShrink: 0,
                  color: 'text.secondary',
                  transition: 'color 160ms ease, transform 160ms ease',
                }}
              />
            </Stack>

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

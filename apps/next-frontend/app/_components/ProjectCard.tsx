import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { Project } from '@/lib/api/schemas';
import { excerpt } from '@/lib/assets';

export function ProjectCard({ project }: { project: Project }) {
  // Portada del proyecto si la tiene: sin fallback a las imágenes de los
  // recursos, que son de la galería de la ficha, no de la tarjeta.
  const cover = project.coverUrl;
  const summary = excerpt(project.description);

  return (
    <Link
      href={`/proyectos/${project.slug}`}
      style={{
        color: 'inherit',
        textDecoration: 'none',
        // Cadenas de flex hasta la tarjeta: el `<a>` por defecto es inline y
        // no tiene altura, con lo que el alto del Card no tendría contra qué
        // resolver. Así todas las tarjetas terminan midiendo lo mismo que la
        // fila del carrusel.
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          // La tarjeta crece hasta el alto de su columna en el carrusel: sin
          // esto, una descripción larga estiraría solo su tarjeta.
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          '&:hover .project-title': { color: 'primary.main' },
          // La flecha se mueve y se tiñe con el mismo hover del título: el
          // objetivo del clic es la tarjeta entera, no la flecha.
          '&:hover .project-arrow': {
            color: 'primary.main',
            transform: 'translateX(4px)',
          },
        }}
      >
        {/*
          La banda de medios se reserva siempre, con imagen o sin ella. Es lo
          que mantiene las alturas iguales: si solo se pintara cuando hay
          portada, una tarjeta sin ella quedaría 180px más baja que su vecina.
        */}
        {cover ? (
          <Box
            component="img"
            src={cover}
            alt=""
            loading="lazy"
            sx={{
              width: '100%',
              height: 180,
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <Box aria-hidden sx={{ height: 180 }} />
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

            {/*
              Siempre renderizada: con `minHeight` de 3 líneas, un proyecto
              sin descripción ocupa el mismo hueco que uno con texto largo.
            */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                // MUI v9 ya no trae `lineClamp`, así que va el CSS a mano.
                // Sin este recorte, 160 caracteres ocupan líneas distintas
                // según el ancho de la columna y las tarjetas dejan de ser
                // iguales.
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
                overflow: 'hidden',
                minHeight: 'calc(3 * 1.43em)',
              }}
            >
              {summary}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
}

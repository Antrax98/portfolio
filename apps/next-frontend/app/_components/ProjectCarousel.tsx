'use client';

import { useRef, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { portfolioApi } from '@/lib/api/client/portfolio';
import type { Project } from '@/lib/api/schemas';
import { ProjectCard } from './ProjectCard';

interface Props {
  initial: Project[];
  total: number;
  size: number;
}

export function ProjectCarousel({ initial, total, size }: Props) {
  const [items, setItems] = useState(initial);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(false);
  const pista = useRef<HTMLDivElement>(null);

  const quedan = items.length < total;

  async function cargarMas() {
    // El evento de scroll se dispara decenas de veces por segundo: sin este
    // guardia, un solo deslizamiento lanza veinte peticiones iguales.
    if (cargando || !quedan) return;

    setCargando(true);
    try {
      const siguiente = pagina + 1;
      const datos = await portfolioApi.page(siguiente, size);

      setItems((actuales) => {
        // La contrapartida del offset: si se publica algo entre una página y la
        // siguiente, todo se desplaza y un proyecto se repetiría.
        const vistos = new Set(actuales.map((p) => p.id));
        return [
          ...actuales,
          ...datos.projects.items.filter((p) => !vistos.has(p.id)),
        ];
      });
      setPagina(siguiente);
    } catch {
      // A propósito. Si falla la página 3, el visitante conserva las anteriores
      // y el carrusel sigue usable; una alerta roja en una página pública
      // asusta más de lo que informa. Lo que no puede quedarse es `cargando`.
    } finally {
      setCargando(false);
    }
  }

  function alDesplazar() {
    const el = pista.current;
    if (!el) return;

    // A una pantalla del final, no en el borde: así el bloque siguiente suele
    // estar cargado antes de que se vea.
    const restante = el.scrollWidth - el.scrollLeft - el.clientWidth;
    if (restante < el.clientWidth) void cargarMas();
  }

  function deslizar(sentido: 1 | -1) {
    const el = pista.current;
    if (!el) return;

    // Una pantalla por clic y no una tarjeta: así avanza cuatro en escritorio y
    // una en móvil sin que el componente sepa cuántas caben.
    el.scrollBy({ left: sentido * el.clientWidth, behavior: 'smooth' });
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Proyectos{' '}
          <Typography component="span" variant="h6" color="text.secondary">
            {total}
          </Typography>
        </Typography>

        <Stack direction="row" sx={{ display: { xs: 'none', md: 'flex' } }}>
          <IconButton
            onClick={() => deslizar(-1)}
            aria-label="Proyectos anteriores"
            size="small"
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={() => deslizar(1)}
            aria-label="Proyectos siguientes"
            size="small"
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Box
        ref={pista}
        onScroll={alDesplazar}
        role="region"
        aria-label="Proyectos"
        tabIndex={0}
        sx={{
          display: 'grid',
          gridAutoFlow: 'column',
          // El único sitio donde se decide cuántas se ven. El `- 12px` descuenta
          // el hueco: con gap de 16 y cuatro columnas, 16 × 3 / 4 = 12.
          gridAutoColumns: { xs: '85%', sm: '45%', md: 'calc(25% - 12px)' },
          gap: 2,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          pb: 1,
          // Ocultar la barra, nunca el scroll: un overflow hidden mataría el
          // gesto táctil.
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {items.map((project) => (
          <Box key={project.id} sx={{ scrollSnapAlign: 'start' }}>
            <ProjectCard project={project} />
          </Box>
        ))}
      </Box>
    </Stack>
  );
}

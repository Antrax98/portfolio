'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button } from '@mui/material';

interface Props {
  children: ReactNode;
  /** Altura recortada, en líneas de texto. */
  lines?: number;
}

export function Expandable({ children, lines = 15 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  // Alto real del contenido, para poder animar hasta él.
  const [contentHeight, setContentHeight] = useState(0);
  const clipRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const collapsedHeight = `${lines * 1.6}em`;

  useEffect(() => {
    const clip = clipRef.current;
    const content = contentRef.current;
    if (!clip || !content) return;

    // Contra el límite en píxeles, no contra el alto actual del clip: estando
    // expandido el clip no recorta nada, saldría que cabe y el botón para volver
    // a contraer desaparecería.
    const check = () => {
      const em = parseFloat(getComputedStyle(clip).fontSize);
      setContentHeight(content.scrollHeight);
      setOverflows(content.scrollHeight > em * lines * 1.6 + 1);
    };

    // Tras el primer pintado: en el momento del efecto los estilos de Emotion
    // pueden no estar aplicados y las dos alturas salen iguales.
    const frame = requestAnimationFrame(check);

    // El observer va sobre el contenido, no sobre el clip: el clip tiene altura
    // fija y no cambia de tamaño aunque el texto de dentro crezca, así que
    // observarlo no dispararía nunca.
    const observer = new ResizeObserver(check);
    observer.observe(content);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [lines, children]);

  return (
    <Box>
      <Box sx={{ position: 'relative' }}>
        {/*
          El recorte lo hace `maxHeight` y no un <Collapse>, para que valga ya en
          el HTML del servidor: con JS el contenido aparecía entero y se plegaba
          al medir, que es justo el parpadeo que se veía al cargar.

          `maxHeight` limita sin forzar, así que un texto corto sigue ocupando lo
          suyo en vez de dejar hueco.
        */}
        <Box
          ref={clipRef}
          sx={{
            // A la altura medida y no a `none`: `max-height: none` no se puede
            // animar, y el despliegue salía de golpe.
            maxHeight: expanded ? `${contentHeight}px` : collapsedHeight,
            overflow: 'hidden',
            transition: 'max-height 320ms ease',
          }}
        >
          <Box ref={contentRef}>{children}</Box>
        </Box>

        {overflows && (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4em',
              pointerEvents: 'none',
              // Siempre montado y con la opacidad animada: si se desmontara al
              // expandir, el degradado desaparecería de golpe a mitad de la
              // transición de la altura.
              opacity: expanded ? 0 : 1,
              transition: 'opacity 240ms ease',
              background:
                'linear-gradient(to bottom, transparent, var(--mui-palette-background-default, #111823))',
            }}
          />
        )}
      </Box>

      {overflows && (
        <Button
          onClick={() => setExpanded((value) => !value)}
          size="small"
          sx={{ mt: 1, ml: -1, color: 'text.secondary' }}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transition: 'transform 200ms ease',
                transform: expanded ? 'rotate(180deg)' : 'none',
              }}
            />
          }
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </Button>
      )}
    </Box>
  );
}

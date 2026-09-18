'use client';

import type { ReactNode } from 'react';
import { Typography } from '@mui/material';

/**
 * El encabezado de un grupo de campos.
 *
 * Existe para que todas las secciones se lean igual: el título de `RowsEditor`
 * quedaba fuera del borde de los `TextField`, y el resto de campos no tenía
 * ninguno, así que la columna izquierda no cuadraba.
 */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>
      {children}
    </Typography>
  );
}

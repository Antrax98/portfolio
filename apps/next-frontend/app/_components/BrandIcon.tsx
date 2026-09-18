import { SvgIcon, type SvgIconProps } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import type { SimpleIcon } from 'simple-icons';

/**
 * Envuelve un icono de simple-icons en el SvgIcon de MUI, para que herede
 * tamaño y color como cualquier otro icono del tema.
 *
 * Los iconos son CC0, pero los logos siguen siendo marcas de sus dueños: se
 * usan para identificar el destino de un enlace, que es uso nominativo.
 */
export function brandIcon(icon: SimpleIcon): SvgIconComponent {
  function Brand(props: SvgIconProps) {
    return (
      <SvgIcon {...props} viewBox="0 0 24 24">
        <title>{icon.title}</title>
        <path d={icon.path} />
      </SvgIcon>
    );
  }

  Brand.displayName = `Brand(${icon.title})`;
  Brand.muiName = 'SvgIcon';
  return Brand as unknown as SvgIconComponent;
}

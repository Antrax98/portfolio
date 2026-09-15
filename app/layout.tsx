import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import ThemeRegistry from './ThemeRegistry';

export const metadata: Metadata = {
  title: 'Portafolio',
  description: 'Proyectos y perfil',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es">
      <body>
        <AppRouterCacheProvider>
          <ThemeRegistry>{children}</ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Emite un servidor autocontenido en .next/standalone, con solo las
  // dependencias que el runtime realmente usa. Sin esto la imagen tiene que
  // cargar con node_modules entero; con esto baja a una fracción.
  output: 'standalone',

  // Sin esto, Next ve el pnpm-lock.yaml de la raíz del monorepo, deduce que la
  // raíz del proyecto está dos niveles más arriba y emite el standalone dentro
  // de .next/standalone/apps/next-frontend/. En Docker el contexto es SOLO
  // esta carpeta, así que la ruta sería distinta según dónde compiles y el
  // COPY del Dockerfile apuntaría a la nada. Fijándola acá, la salida es
  // plana y siempre igual.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;

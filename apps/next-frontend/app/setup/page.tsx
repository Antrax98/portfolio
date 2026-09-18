import { redirect } from 'next/navigation';
import { getPortfolio } from '@/lib/api/server/portfolio';
import { SetupForm } from './SetupForm';

/**
 * Dinámica a la fuerza. Es la única página que no lee la cookie, así que Next la
 * daba por estática e intentaba prerenderizarla al compilar — y eso exigía tener
 * el backend levantado durante el build. Además su respuesta depende del estado
 * del servidor *en cada visita*: si ya hay cuenta, redirige.
 */
export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  // El registro se cierra solo en el backend, pero sin esto la página seguiría
  // siendo alcanzable escribiendo la URL y ofrecería un formulario que solo
  // sabe fallar.
  const portfolio = await getPortfolio();
  if (portfolio) redirect('/');

  return <SetupForm />;
}

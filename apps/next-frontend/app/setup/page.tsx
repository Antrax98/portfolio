import { redirect } from 'next/navigation';
import { getPortfolio } from '@/lib/api/server/portfolio';
import { SetupForm } from './SetupForm';

export default async function SetupPage() {
  // El registro se cierra solo en el backend, pero sin esto la página seguiría
  // siendo alcanzable escribiendo la URL y ofrecería un formulario que solo
  // sabe fallar.
  const portfolio = await getPortfolio();
  if (portfolio) redirect('/');

  return <SetupForm />;
}

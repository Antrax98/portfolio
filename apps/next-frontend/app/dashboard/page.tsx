import { getDashboardData } from '@/lib/api/server/dashboard';
import { DashboardPanel } from './DashboardPanel';

export default async function DashboardPage() {
  const { profile, projects } = await getDashboardData();

  return <DashboardPanel profile={profile} projects={projects} />;
}

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function DashboardRedirect() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'ADMIN') {
    redirect('/dashboard/admin');
  } else if (session.role === 'ANALYST') {
    redirect('/dashboard/analyst');
  } else if (session.role === 'VIEWER') {
    redirect('/dashboard/viewer');
  }

  // Fallback
  redirect('/login');
}

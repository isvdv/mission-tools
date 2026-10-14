import { redirect } from 'next/navigation';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { requireWebAuth } from '../../lib/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireWebAuth();
  } catch {
    redirect('/login');
  }

  return (
    <div className="min-h-screen lg:pl-72">
      <Sidebar />
      <Topbar />
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}

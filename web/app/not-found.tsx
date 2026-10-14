import { Button } from '../components/Button';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <section className="technical-panel w-full max-w-xl rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="font-mono text-xs uppercase text-[var(--danger)]">ERROR 404</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">RESOURCE NOT FOUND</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          The requested module does not exist or the route is unavailable in the current session.
        </p>
        <div className="mt-6">
          <Button href="/dashboard" variant="secondary">RETURN /DASHBOARD</Button>
        </div>
      </section>
    </main>
  );
}

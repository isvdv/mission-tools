import { Button } from '../components/Button';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <section className="w-full max-w-xl rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="font-mono text-sm text-[var(--text-muted)]">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">Página não encontrada</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          O endereço pode ter mudado ou não existe mais. Volte ao painel para escolher uma ferramenta.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/dashboard">Ir para o painel</Button>
          <Button href="/" variant="ghost">Página inicial</Button>
        </div>
      </section>
    </main>
  );
}

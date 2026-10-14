import { Monitor, PanelsTopLeft, ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { ToolDirectory } from '../components/ToolDirectory';

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 sm:px-8 lg:px-12">
      <nav aria-label="Navegação principal" className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-6">
        <a href="/" className="flex items-center gap-3 font-semibold"><PanelsTopLeft className="h-6 w-6 text-[var(--accent)]" />Mission Tools</a><Button href="/login" variant="secondary">Entrar</Button>
      </nav>
      <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:py-20">
        <div>
          <p className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Monitor className="h-4 w-4 shrink-0" />Seu espaço de controle para o Discord</p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">Menos comandos.<br />Mais controle.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[var(--text-secondary)]">Missões, voz e presença em um só lugar. Escolha uma ferramenta, ajuste o que precisa e acompanhe cada execução pelo painel.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button href="/login" className="px-6">Acessar meu painel</Button><Button href="#ferramentas" variant="ghost">Explorar ferramentas</Button></div>
          <div className="mt-12 flex max-w-md items-start gap-3 border-t border-[var(--border)] pt-5 text-sm leading-6 text-[var(--text-secondary)]"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[var(--success)]" /><p>Seu token é armazenado de forma criptografada. Você controla sua sessão e pode sair a qualquer momento.</p></div>
        </div>
        <section id="ferramentas" aria-labelledby="tools-title" className="scroll-mt-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-5 sm:px-6"><h2 id="tools-title" className="text-base font-semibold">Sua caixa de ferramentas</h2><span className="shrink-0 text-xs text-[var(--text-muted)]">6 módulos</span></div>
          <ToolDirectory /><p className="border-t border-[var(--border)] px-6 py-4 text-xs leading-5 text-[var(--text-muted)]">Escolha uma ferramenta. Se necessário, você será direcionado para entrar.</p>
        </section>
      </section>
      <footer className="flex flex-wrap justify-between gap-3 border-t border-[var(--border)] py-6 text-xs text-[var(--text-muted)]"><span>Mission Tools</span><span>No navegador, no computador e como app instalável.</span></footer>
    </main>
  );
}

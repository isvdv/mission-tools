import { ArrowRight, LockKeyhole, PanelsTopLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const modules = ['Sistema de Missoes', 'Sistema de Limpeza', 'Sessao de Voz', 'Rich Presence', 'Verificador de Usernames', 'Apagar DM do Bot'];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-cyanSoft text-ink">
            <PanelsTopLeft className="h-5 w-5" />
          </span>
          <strong>Mission Tools</strong>
        </div>
        <Button href="/login" variant="secondary">Entrar</Button>
      </nav>

      <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyanSoft/30 bg-cyanSoft/10 px-3 py-1 text-sm text-cyanSoft">
            <Sparkles className="h-4 w-4" />
            Painel web com login por token
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
            Mission Tools
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Controle missoes, sessoes de voz, Rich Presence, limpeza e verificacao de usernames em um painel web conectado a logica real do bot.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/login">
              Entrar com token <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/dashboard" variant="secondary">Abrir painel</Button>
          </div>
        </div>

        <Card className="grid gap-3">
          {modules.map((module) => (
            <div key={module} className="flex items-center justify-between rounded-lg border border-white/10 bg-ink/50 p-4">
              <span>{module}</span>
              <span className="h-2 w-2 rounded-full bg-cyanSoft" />
            </div>
          ))}
        </Card>
      </section>

      <section className="grid gap-4 pb-12 md:grid-cols-2">
        <Card>
          <ShieldCheck className="mb-3 h-7 w-7 text-emerald-300" />
          <h2 className="text-xl font-semibold">Modelo de seguranca</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            O navegador envia o token uma vez. O servidor valida, salva criptografado e nunca devolve o token para o frontend.
          </p>
        </Card>
        <Card>
          <LockKeyhole className="mb-3 h-7 w-7 text-violetSoft" />
          <h2 className="text-xl font-semibold">Servicos compartilhados</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            As rotas da API usam a mesma camada de servicos dos modulos do bot, mantendo o painel conectado ao comportamento real.
          </p>
        </Card>
      </section>

      <footer className="border-t border-white/10 py-6 text-sm text-slate-500">
        Painel web Mission Tools.
      </footer>
    </main>
  );
}

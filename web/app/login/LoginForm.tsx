'use client';

import { useState } from 'react';
import { AlertCircle, Eye, EyeOff, KeyRound, ShieldCheck, Terminal } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { apiRequest } from '../../lib/api';

export function LoginForm() {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const cleanedToken = token.trim();
    if (!cleanedToken) {
      setMessage('Informe o token de acesso para continuar.');
      return;
    }

    setLoading(true);
    setMessage('');
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ token: cleanedToken })
    });
    setLoading(false);
    if (result.success) {
      window.location.assign('/dashboard');
      return;
    }
    setMessage(result.error ? `${result.message} ${result.error}` : result.message);
  }

  return (
    <section className="grid w-full max-w-4xl overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] md:grid-cols-[0.82fr_1.18fr]">
      <div className="border-b border-[var(--border)] bg-black/40 p-6 md:border-b-0 md:border-r">
        <span className="mb-5 grid h-11 w-11 place-items-center rounded-[var(--radius-sm)] border border-[var(--accent)] bg-black text-[var(--accent)]">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <p className="text-sm text-[var(--accent)]">Sua conta, suas ferramentas</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Mission Tools</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          Entre para acompanhar missões, configurar sua presença e gerenciar as ferramentas do Discord.
        </p>
        <div className="mt-8 grid gap-2 border-y border-[var(--border)] py-4 font-mono text-[11px]">
          <div className="flex justify-between gap-3">
            <span className="text-[var(--text-muted)]">Acesso</span>
            <span className="text-[var(--text-primary)]">Token do Discord</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[var(--text-muted)]">Armazenamento</span>
            <span className="text-[var(--success)]">Criptografado</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[var(--text-muted)]">Disponível em</span>
            <span className="text-[var(--success)]">Web e app</span>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-2 border border-[var(--border)] bg-black px-3 py-2">
          <Terminal className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <p className="m-0 font-mono text-xs text-[var(--text-secondary)]">Entre no seu painel</p>
        </div>

        <label htmlFor="token" className="mb-2 block text-sm text-[var(--text-secondary)]">
          Token de acesso
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            id="token"
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="none"
            type={showToken ? 'text' : 'password'}
            placeholder="Cole o token"
            value={token}
            onChange={(event) => {
              setToken(event.target.value);
              if (message) setMessage('');
            }}
            aria-invalid={Boolean(message)}
            aria-describedby={message ? 'token-error' : undefined}
            className={`h-11 w-full rounded-[var(--radius-sm)] border bg-black px-10 py-0 font-mono text-base text-[var(--text-primary)] outline-none transition duration-150 placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] sm:text-sm ${
              message ? 'border-[var(--danger)]' : 'border-[var(--border)]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowToken((current) => !current)}
            aria-label={showToken ? 'Ocultar token' : 'Mostrar token'}
            title={showToken ? 'Ocultar token' : 'Mostrar token'}
            className="absolute right-1.5 top-1/2 grid h-[30px] w-[30px] -translate-y-1/2 place-items-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition duration-150 hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
          >
            {showToken ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
          </button>
        </div>

        <div className="min-h-7 pt-2">
          {message ? (
            <p role="alert" id="token-error" className="flex items-start gap-1.5 text-xs leading-5 text-[var(--danger)]">
              <AlertCircle className="mt-0.5 h-[13px] w-[13px] shrink-0" />
              <span>{message}</span>
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-semibold text-black transition duration-150 hover:bg-[#bdd2ff] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <LoadingSpinner /> : null}
          {loading ? 'Validando...' : 'Entrar no painel'}
        </button>

        <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
          Não tem um token? Peça orientação ao administrador.
        </p>
      </form>
    </section>
  );
}

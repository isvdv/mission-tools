'use client';

import { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Info, KeyRound, ShieldCheck } from 'lucide-react';
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
    <section className="w-full max-w-[400px]">
      <div className="mb-7 text-center">
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl border border-[#2a5a73] bg-[#173347] text-[#4fd1e8]">
          <ShieldCheck className="h-[22px] w-[22px]" />
        </span>
        <h1 className="text-lg font-medium text-[#f2f5f7]">Mission Tools</h1>
        <p className="mt-1 text-[13px] text-[#8a97a6]">Acesse o painel de controle</p>
      </div>

      <form onSubmit={submit} className="rounded-[14px] border border-[#232b36] bg-[#141a22] p-7">
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#2a3340] bg-[#0e131a] px-3 py-2">
          <Info className="h-[15px] w-[15px] shrink-0 text-[#5c6773]" />
          <p className="m-0 text-xs text-[#8a97a6]">Somente autenticacao por token esta ativada</p>
        </div>

        <label htmlFor="token" className="mb-1.5 block text-xs text-[#8a97a6]">
          Token de acesso
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c6773]" />
          <input
            id="token"
            type={showToken ? 'text' : 'password'}
            placeholder="Cole ou digite seu token"
            value={token}
            onChange={(event) => {
              setToken(event.target.value);
              if (message) setMessage('');
            }}
            aria-invalid={Boolean(message)}
            className={`h-11 w-full rounded-lg border bg-[#0e131a] px-10 py-0 font-mono text-[13px] text-[#e6ebef] outline-none transition placeholder:text-[#5c6773] focus:border-[#4fd1e8] ${
              message ? 'border-[#e57373]' : 'border-[#2a3340]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowToken((current) => !current)}
            aria-label={showToken ? 'Ocultar token' : 'Mostrar token'}
            title={showToken ? 'Ocultar token' : 'Mostrar token'}
            className="absolute right-1.5 top-1/2 grid h-[30px] w-[30px] -translate-y-1/2 place-items-center rounded-md text-[#5c6773] transition hover:bg-white/5 hover:text-[#8a97a6]"
          >
            {showToken ? <EyeOff className="h-[17px] w-[17px]" /> : <Eye className="h-[17px] w-[17px]" />}
          </button>
        </div>

        <div className="min-h-7 pt-2">
          {message ? (
            <p className="flex items-start gap-1.5 text-xs leading-5 text-[#e57373]">
              <AlertCircle className="mt-0.5 h-[13px] w-[13px] shrink-0" />
              <span>{message}</span>
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#4fd1e8] px-4 text-sm font-medium text-[#04202b] transition hover:bg-[#72def0] disabled:cursor-not-allowed disabled:opacity-75"
        >
          {loading ? <LoadingSpinner /> : null}
          {loading ? 'Validando...' : 'Validar token'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-[#5c6773]">
        Nao tem um token? <span className="text-[#4fd1e8]">Fale com o administrador</span>
      </p>
    </section>
  );
}

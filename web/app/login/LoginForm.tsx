'use client';

import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { apiRequest } from '../../lib/api';

export function LoginForm() {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
    setLoading(false);
    if (result.success) {
      window.location.href = '/dashboard';
      return;
    }
    setMessage(result.error ? `${result.message} ${result.error}` : result.message);
  }

  return (
    <Card className="w-full max-w-md">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-cyanSoft text-ink">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold">Entrar com token</h1>
          <p className="text-sm text-slate-400">Somente autenticacao por token esta ativada.</p>
        </div>
      </div>
      <form onSubmit={submit} className="grid gap-4">
        <Input
          type="password"
          placeholder="Cole seu token autorizado"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? <LoadingSpinner /> : null}
          Validar token
        </Button>
        {message ? <p className="text-sm text-rose-200">{message}</p> : null}
      </form>
    </Card>
  );
}

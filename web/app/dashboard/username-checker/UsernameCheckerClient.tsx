'use client';

import { useMemo, useState } from 'react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { Field } from '../../../components/Field';
import { Textarea } from '../../../components/Input';
import { Table } from '../../../components/Table';
import { Badge } from '../../../components/Badge';
import { Toast } from '../../../components/Toast';
import { PanelHeader } from '../../../components/PanelHeader';
import { apiRequest } from '../../../lib/api';

type Result = {
  username: string;
  status: 'available' | 'unavailable' | 'error';
  error?: string;
};

const statusLabels: Record<Result['status'], string> = {
  available: 'Disponível',
  unavailable: 'Em uso',
  error: 'Erro'
};

export function UsernameCheckerClient() {
  const [raw, setRaw] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'success' | 'error'>('success');
  const [checking, setChecking] = useState(false);
  const usernames = useMemo(() => raw.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean), [raw]);

  const rows = useMemo(() => results.map((result) => [
    result.username,
    <Badge key={result.username} tone={result.status === 'available' ? 'good' : result.status === 'error' ? 'bad' : 'warn'}>{statusLabels[result.status]}</Badge>,
    result.error ?? '-'
  ]), [results]);

  async function check() {
    setChecking(true);
    setMessage('');
    const response = await apiRequest<{ results: Result[] }>('/api/username/check', {
      method: 'POST',
      body: JSON.stringify({ usernames })
    });
    setChecking(false);
    setTone(response.success ? 'success' : 'error');
    if (response.success) {
      setResults(response.data.results);
      setMessage(response.message);
      return;
    }
    setMessage([response.message, response.error].filter(Boolean).join(' '));
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resultados-usernames.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const csv = ['username,status,erro', ...results.map((r) => `${r.username},${r.status},${r.error ?? ''}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resultados-usernames.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="grid gap-5">
      <PanelHeader title="Verificar nomes" description="Cole os nomes separados por linha ou vírgula." />
      <Field label="Nomes de usuário" htmlFor="username-buffer" description={usernames.length ? `${usernames.length} ${usernames.length === 1 ? 'nome' : 'nomes'}` : 'Um por linha'}>
        <Textarea id="username-buffer" spellCheck={false} autoCapitalize="none" className="font-mono" placeholder={'usuario_01\nusuario_02'} value={raw} onChange={(event) => setRaw(event.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
        <Button onClick={check} loading={checking} disabled={!usernames.length}>Verificar</Button>
        <Button variant="secondary" onClick={exportJson} disabled={!results.length}>Exportar JSON</Button>
        <Button variant="secondary" onClick={exportCsv} disabled={!results.length}>Exportar CSV</Button>
      </div>
      <div aria-live="polite">{message ? <Toast message={message} tone={tone} /> : null}</div>
      {results.length ? (
        <Table headers={['Nome', 'Situação', 'Detalhe']} rows={rows} />
      ) : (
        <EmptyState title="Nenhum resultado ainda" description="Cole alguns nomes acima e clique em Verificar para ver quais estão livres." />
      )}
    </Card>
  );
}

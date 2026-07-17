'use client';

import { useMemo, useState } from 'react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Textarea } from '../../../components/Input';
import { Table } from '../../../components/Table';
import { Badge } from '../../../components/Badge';
import { Toast } from '../../../components/Toast';
import { apiRequest } from '../../../lib/api';

type Result = {
  username: string;
  status: 'available' | 'unavailable' | 'error';
  error?: string;
};

const statusLabels: Record<Result['status'], string> = {
  available: 'disponivel',
  unavailable: 'indisponivel',
  error: 'erro'
};

export function UsernameCheckerClient() {
  const [raw, setRaw] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [message, setMessage] = useState('');

  const rows = useMemo(() => results.map((result) => [
    result.username,
    <Badge key={result.username} tone={result.status === 'available' ? 'good' : result.status === 'error' ? 'bad' : 'warn'}>{statusLabels[result.status]}</Badge>,
    result.error ?? '-'
  ]), [results]);

  async function check() {
    setMessage('Verificando usernames...');
    const usernames = raw.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
    const response = await apiRequest<{ results: Result[] }>('/api/username/check', {
      method: 'POST',
      body: JSON.stringify({ usernames })
    });
    if (response.success) {
      setResults(response.data.results);
      setMessage(response.message);
      return;
    }
    setMessage(response.message);
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
    <Card className="grid gap-4">
      <Textarea placeholder="Digite um username por linha" value={raw} onChange={(event) => setRaw(event.target.value)} />
      <div className="flex flex-wrap gap-3">
        <Button onClick={check}>Verificar</Button>
        <Button variant="secondary" onClick={exportJson} disabled={!results.length}>Exportar JSON</Button>
        <Button variant="secondary" onClick={exportCsv} disabled={!results.length}>Exportar CSV</Button>
      </div>
      {message ? <Toast message={message} /> : null}
      {results.length ? <Table headers={['Username', 'Status', 'Erro']} rows={rows} /> : null}
    </Card>
  );
}

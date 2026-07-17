import { Card } from '../../../components/Card';
import { UsernameCheckerClient } from './UsernameCheckerClient';

export default function UsernameCheckerPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <h2 className="text-2xl font-semibold">Verificador de Usernames</h2>
        <p className="mt-2 text-slate-300">Verifique uma lista de usernames e exporte os resultados em JSON ou CSV.</p>
      </Card>
      <UsernameCheckerClient />
    </div>
  );
}

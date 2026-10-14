import { PageHeader } from '../../../components/PageHeader';
import { UsernameCheckerClient } from './UsernameCheckerClient';

export default function UsernameCheckerPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Mission Tools"
        title="Verificador de Usernames"
        description="Verifique uma lista de usernames e exporte os resultados em JSON ou CSV."
      />
      <UsernameCheckerClient />
    </div>
  );
}

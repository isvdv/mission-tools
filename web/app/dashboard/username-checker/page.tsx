import { PageHeader } from '../../../components/PageHeader';
import { UsernameCheckerClient } from './UsernameCheckerClient';

export default function UsernameCheckerPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Mission Tools"
        title="Nomes de usuário"
        description="Verifique quais nomes de usuário estão livres e exporte o resultado em JSON ou CSV."
      />
      <UsernameCheckerClient />
    </div>
  );
}

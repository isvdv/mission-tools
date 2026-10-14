import { Info } from 'lucide-react';
import { Card } from '../../../components/Card';
import { PageHeader } from '../../../components/PageHeader';

export default function DeleteDmPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Mission Tools"
        title="Apagar DM do bot"
        description="Remova as mensagens de painel que o bot enviou na sua DM."
      />
      <Card className="flex gap-4">
        <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
        <div>
          <h3 className="font-semibold">Disponível apenas pelo Discord</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Essa limpeza usa a sessão ativa do bot, então ainda não pode ser feita pelo painel web nem pelo app de desktop.
            Abra a DM com o bot no Discord e, no menu do painel, escolha <strong className="font-semibold text-[var(--text-primary)]">Delete Bot DM</strong>.
          </p>
        </div>
      </Card>
    </div>
  );
}

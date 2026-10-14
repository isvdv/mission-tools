import { PageHeader } from '../../../components/PageHeader';
import { requireWebAuth } from '../../../lib/server';
import { settingsService } from '../../../../src/services/settingsService';
import { SettingsClient } from './SettingsClient';

export default async function SettingsPage() {
  const auth = await requireWebAuth();
  const settings = await settingsService.get(auth.userId);
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Mission Tools"
        title="Configuracoes"
        description="Configure padroes do painel, modulos e destinos de integracao."
      />
      <SettingsClient initial={settings} />
    </div>
  );
}

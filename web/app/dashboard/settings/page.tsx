import { Card } from '../../../components/Card';
import { requireWebAuth } from '../../../lib/server';
import { settingsService } from '../../../../src/services/settingsService';
import { SettingsClient } from './SettingsClient';

export default async function SettingsPage() {
  const auth = await requireWebAuth();
  const settings = await settingsService.get(auth.userId);
  return (
    <div className="grid gap-6">
      <Card>
        <h2 className="text-2xl font-semibold">Configuracoes</h2>
        <p className="mt-2 text-slate-300">Configure padroes do painel, modulos e destinos de integracao.</p>
      </Card>
      <SettingsClient initial={settings} />
    </div>
  );
}

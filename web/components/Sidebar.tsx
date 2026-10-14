import { requireWebAuth } from '../lib/server';
import { avatarUrl, fetchCurrentAccount } from '../lib/discord';
import { SidebarChrome } from './SidebarChrome';

export async function Sidebar() {
  let account:
    | {
        id: string;
        username: string;
        global_name?: string | null;
        avatar?: string | null;
      }
    | null = null;
  let userId = '';

  try {
    const auth = await requireWebAuth();
    userId = auth.userId;
    account = await fetchCurrentAccount(auth.token);
  } catch {
    account = null;
  }

  return <SidebarChrome account={account} userId={userId} avatarSrc={account ? avatarUrl(account) : undefined} />;
}

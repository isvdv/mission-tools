import { TtlCache, secretKey } from '@root/src/ttlCache';

export type DiscordAccount = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
};

export type DiscordGuild = {
  id: string;
  name: string;
  icon?: string | null;
  permissions?: string;
};

export type DiscordVoiceChannel = {
  id: string;
  name: string;
  type: number;
  guild_id?: string;
};

const API_BASE_URL = 'https://discord.com/api/v10';
const ADMINISTRATOR = 0x8n;
const MANAGE_GUILD = 0x20n;
const DISCORD_FETCH_TIMEOUT_MS = 15000;
// Sidebar, layout and pages each ask for the same data on every navigation;
// this keeps that to one Discord round trip per minute per account.
const DISCORD_CACHE_TTL_MS = 60_000;

const accountCache = new TtlCache<DiscordAccount>(DISCORD_CACHE_TTL_MS);
const guildCache = new TtlCache<DiscordGuild[]>(DISCORD_CACHE_TTL_MS);
const voiceChannelCache = new TtlCache<DiscordVoiceChannel[]>(DISCORD_CACHE_TTL_MS);

function headers(token: string): HeadersInit {
  return {
    Authorization: token,
    'Content-Type': 'application/json',
    'User-Agent': 'Mission-Tools-Web/1.0'
  };
}

async function discordFetch(token: string, path: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DISCORD_FETCH_TIMEOUT_MS);

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      headers: headers(token),
      cache: 'no-store',
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Tempo esgotado ao acessar o Discord.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function avatarUrl(account: DiscordAccount): string {
  if (!account.avatar) {
    return `https://cdn.discordapp.com/embed/avatars/${Number(account.id) % 5}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${account.id}/${account.avatar}.png?size=128`;
}

export async function fetchCurrentAccount(token: string): Promise<DiscordAccount> {
  return accountCache.get(secretKey(token), async () => {
    const response = await discordFetch(token, '/users/@me');
    if (!response.ok) throw new Error('Nao foi possivel carregar a conta do Discord.');
    return (await response.json()) as DiscordAccount;
  });
}

export async function fetchManageableGuilds(token: string): Promise<DiscordGuild[]> {
  const guilds = await guildCache.get(secretKey(token), async () => {
    const response = await discordFetch(token, '/users/@me/guilds');
    if (!response.ok) throw new Error('Nao foi possivel carregar os servidores.');
    return (await response.json()) as DiscordGuild[];
  });
  return guilds.filter((guild) => {
    const permissions = BigInt(guild.permissions ?? '0');
    return Boolean(permissions & ADMINISTRATOR) || Boolean(permissions & MANAGE_GUILD);
  });
}

export async function fetchVoiceChannels(
  token: string,
  guildId: string
): Promise<DiscordVoiceChannel[]> {
  try {
    return await voiceChannelCache.get(`${secretKey(token)}:${guildId}`, async () => {
      const response = await discordFetch(token, `/guilds/${guildId}/channels`);
      // Thrown so the empty fallback is not cached.
      if (!response.ok) throw new Error(`Discord HTTP ${response.status}`);
      const channels = (await response.json()) as DiscordVoiceChannel[];
      return channels.filter((channel) => channel.type === 2 || channel.type === 13);
    });
  } catch {
    return [];
  }
}

export async function accountCanManageGuild(
  token: string,
  guildId?: string
): Promise<boolean> {
  if (!guildId) return true;
  const guilds = await fetchManageableGuilds(token);
  return guilds.some((guild) => guild.id === guildId);
}

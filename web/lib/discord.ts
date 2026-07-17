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

function headers(token: string): HeadersInit {
  return {
    Authorization: token,
    'Content-Type': 'application/json',
    'User-Agent': 'Mission-Tools-Web/1.0'
  };
}

export function avatarUrl(account: DiscordAccount): string {
  if (!account.avatar) {
    return `https://cdn.discordapp.com/embed/avatars/${Number(account.id) % 5}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${account.id}/${account.avatar}.png?size=128`;
}

export async function fetchCurrentAccount(token: string): Promise<DiscordAccount> {
  const response = await fetch(`${API_BASE_URL}/users/@me`, {
    headers: headers(token),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Nao foi possivel carregar a conta do Discord.');
  return (await response.json()) as DiscordAccount;
}

export async function fetchManageableGuilds(token: string): Promise<DiscordGuild[]> {
  const response = await fetch(`${API_BASE_URL}/users/@me/guilds`, {
    headers: headers(token),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Nao foi possivel carregar os servidores.');

  const guilds = (await response.json()) as DiscordGuild[];
  return guilds.filter((guild) => {
    const permissions = BigInt(guild.permissions ?? '0');
    return Boolean(permissions & ADMINISTRATOR) || Boolean(permissions & MANAGE_GUILD);
  });
}

export async function fetchVoiceChannels(
  token: string,
  guildId: string
): Promise<DiscordVoiceChannel[]> {
  const response = await fetch(`${API_BASE_URL}/guilds/${guildId}/channels`, {
    headers: headers(token),
    cache: 'no-store'
  });
  if (!response.ok) return [];

  const channels = (await response.json()) as DiscordVoiceChannel[];
  return channels.filter((channel) => channel.type === 2 || channel.type === 13);
}

export async function accountCanManageGuild(
  token: string,
  guildId?: string
): Promise<boolean> {
  if (!guildId) return true;
  const guilds = await fetchManageableGuilds(token);
  return guilds.some((guild) => guild.id === guildId);
}

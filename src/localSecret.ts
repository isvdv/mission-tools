// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const LOCAL_SECRET_FILE = '.local-secret';

let cachedLocalSecret: string | null = null;

function envSecret(names: string[]): string | null {
	for (const name of names) {
		const value = process.env[name]?.trim();
		if (value) return value;
	}

	return null;
}

function dataDir(): string {
	return path.resolve(
		process.cwd(),
		process.env.MISSION_TOOLS_DATA_DIR?.trim() || 'data',
	);
}

/**
 * Secret persisted next to the app data, generated on first use. Replaces the
 * old hardcoded fallbacks, which let anyone forge sessions or decrypt stored
 * tokens when no secret was configured in the environment.
 */
function localSecret(): string {
	if (cachedLocalSecret) return cachedLocalSecret;

	const directory = dataDir();
	const secretPath = path.join(directory, LOCAL_SECRET_FILE);
	try {
		const existing = readFileSync(secretPath, 'utf8').trim();
		if (existing) {
			cachedLocalSecret = existing;
			return existing;
		}
	} catch {
		// Missing file: generated below.
	}

	const secret = randomBytes(32).toString('hex');
	mkdirSync(directory, { recursive: true });
	try {
		writeFileSync(secretPath, secret, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
		cachedLocalSecret = secret;
	} catch {
		// Another process created it first; use theirs so both agree.
		cachedLocalSecret = readFileSync(secretPath, 'utf8').trim();
	}

	return cachedLocalSecret;
}

export function resolveSecret(...envNames: string[]): string {
	return envSecret(envNames) ?? localSecret();
}

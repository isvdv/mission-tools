// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import { createHmac, timingSafeEqual } from 'node:crypto';
import { TokenStore } from '../tokenStore';
import { validateDiscordToken } from '../discord';

export type TokenSession = {
	userId: string;
	createdAt: number;
};

type AcceptedToken = {
	userId: string;
	token: string;
};

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_SEPARATOR = '.';
const TOKEN_VALIDATION_CACHE_TTL_MS = 5 * 60 * 1000;

type TokenValidationCacheEntry = {
	token: string;
	expiresAt: number;
};

const tokenValidationCache = new Map<string, TokenValidationCacheEntry>();

function sessionSecret(): string {
	return (
		process.env.WEB_SESSION_SECRET ||
		process.env.TOKEN_STORE_SECRET ||
		process.env.BOT_TOKEN ||
		'mission-tools-web-session-secret'
	);
}

function base64Url(value: string): string {
	return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string): string {
	return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(payload: string): string {
	return createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	return left.length === right.length && timingSafeEqual(left, right);
}

function cleanSubmittedToken(token: string): string {
	return token
		.trim()
		.replace(/^["']|["']$/g, '')
		.replace(/^Authorization:\s*/i, '')
		.replace(/^Bearer\s+/i, '')
		.trim();
}

function rememberTokenValidation(userId: string, token: string): void {
	tokenValidationCache.set(userId, {
		token,
		expiresAt: Date.now() + TOKEN_VALIDATION_CACHE_TTL_MS,
	});
}

function hasFreshTokenValidation(userId: string, token: string): boolean {
	const cached = tokenValidationCache.get(userId);
	if (!cached) return false;
	if (cached.expiresAt <= Date.now()) {
		tokenValidationCache.delete(userId);
		return false;
	}

	return cached.token === token;
}

async function validateAcceptedToken(token: string): Promise<AcceptedToken | null> {
	const cleanedToken = cleanSubmittedToken(token);
	if (!cleanedToken) return null;

	const candidates = [
		cleanedToken,
		...(cleanedToken.toLowerCase().startsWith('bot ')
			? []
			: [`Bot ${cleanedToken}`]),
	];

	for (const candidate of candidates) {
		const validation = await validateDiscordToken(candidate);
		if (validation.valid && validation.userId) {
			return {
				userId: validation.userId,
				token: candidate,
			};
		}
	}

	return null;
}

export class AuthService {
	constructor(private readonly tokenStore = new TokenStore()) {}

	async loginWithToken(token: string): Promise<TokenSession> {
		const cleanedToken = cleanSubmittedToken(token);
		if (!cleanedToken) {
			throw new Error('Token is required.');
		}

		const acceptedToken = await validateAcceptedToken(cleanedToken);
		if (!acceptedToken) {
			throw new Error(
				'Invalid Discord token. Paste the raw token only. Bot tokens are accepted with or without the "Bot " prefix.',
			);
		}

		await this.tokenStore.set(acceptedToken.userId, acceptedToken.token);
		rememberTokenValidation(acceptedToken.userId, acceptedToken.token);
		return {
			userId: acceptedToken.userId,
			createdAt: Date.now(),
		};
	}

	createSessionCookie(session: TokenSession): string {
		const payload = base64Url(JSON.stringify(session));
		return `${payload}${SESSION_SEPARATOR}${sign(payload)}`;
	}

	parseSessionCookie(cookieValue?: string): TokenSession | null {
		if (!cookieValue) return null;

		const [payload, signature] = cookieValue.split(SESSION_SEPARATOR);
		if (!payload || !signature || !safeEqual(signature, sign(payload))) {
			return null;
		}

		try {
			const session = JSON.parse(fromBase64Url(payload)) as TokenSession;
			const expiresAt = session.createdAt + SESSION_MAX_AGE_SECONDS * 1000;
			if (!session.userId || Date.now() > expiresAt) return null;
			return session;
		} catch {
			return null;
		}
	}

	async requireToken(userId: string): Promise<string> {
		const token = await this.tokenStore.get(userId);
		if (!token) throw new Error('Token not configured.');
		if (hasFreshTokenValidation(userId, token)) return token;

		const validation = await validateDiscordToken(token);
		if (!validation.valid || validation.userId !== userId) {
			await this.tokenStore.delete(userId);
			tokenValidationCache.delete(userId);
			throw new Error('Stored token is invalid. Login again.');
		}

		rememberTokenValidation(userId, token);
		return token;
	}

	async logout(userId: string): Promise<void> {
		await this.tokenStore.delete(userId);
		tokenValidationCache.delete(userId);
	}
}

export const authService = new AuthService();
export const WEB_SESSION_COOKIE = 'mission_tools_session';
export const WEB_SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_SECONDS;

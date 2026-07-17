// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import axios from 'axios';

export type UsernameCheckResult = {
	username: string;
	status: 'available' | 'unavailable' | 'error';
	error?: string;
};

export class UsernameService {
	async checkList(usernames: string[]): Promise<UsernameCheckResult[]> {
		const normalized = usernames
			.map((username) => username.trim())
			.filter(Boolean)
			.slice(0, 100);

		const results: UsernameCheckResult[] = [];
		for (const username of normalized) {
			results.push(await this.checkOne(username));
		}
		return results;
	}

	private async checkOne(username: string): Promise<UsernameCheckResult> {
		try {
			const response = await axios.post(
				'https://discord.com/api/v9/unique-username/username-attempt-unauthed',
				{ username },
				{
					timeout: 10000,
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': 'Mission-Tools-Web/1.0',
					},
				},
			);

			return {
				username,
				status: response.data?.taken ? 'unavailable' : 'available',
			};
		} catch (error) {
			return {
				username,
				status: 'error',
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}
}

export const usernameService = new UsernameService();

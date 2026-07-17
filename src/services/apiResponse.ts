// Credito: Perfil Discord https://discord.com/users/1411202571804348507
export type ApiSuccess<T = unknown> = {
	success: true;
	message: string;
	data: T;
};

export type ApiFailure = {
	success: false;
	message: string;
	error?: string;
};

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiFailure;

export function ok<T>(message: string, data: T): ApiSuccess<T> {
	return {
		success: true,
		message,
		data,
	};
}

export function fail(message: string, error?: unknown): ApiFailure {
	return {
		success: false,
		message,
		...(error
			? { error: error instanceof Error ? error.message : String(error) }
			: {}),
	};
}

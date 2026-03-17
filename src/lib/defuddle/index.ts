export const DEFUDDLE_BASE_URL = 'https://defuddle.md';

export async function fetchMarkdown(url: string): Promise<string> {
	const encodedUrl = encodeURIComponent(url);
	const response = await fetch(`${DEFUDDLE_BASE_URL}/${encodedUrl}`, {
		signal: AbortSignal.timeout(30000),
	});

	if (!response.ok) {
		throw new Error(`Defuddle error: ${response.status} ${response.statusText}`);
	}

	return response.text();
}
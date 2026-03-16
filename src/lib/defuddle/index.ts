export const DEFUDDLE_BASE_URL = 'https://defuddle.md';

export async function fetchMarkdown(url: string): Promise<string> {
	// Defuddle expects the URL without protocol, appended to defuddle.md/
	// e.g., https://defuddle.md/example.com/path
	const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
	const response = await fetch(`${DEFUDDLE_BASE_URL}/${urlWithoutProtocol}`, {
		signal: AbortSignal.timeout(30000),
	});

	if (!response.ok) {
		throw new Error(`Defuddle error: ${response.status} ${response.statusText}`);
	}

	return response.text();
}
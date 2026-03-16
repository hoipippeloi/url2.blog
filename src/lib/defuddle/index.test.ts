import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('fetchMarkdown', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fetches markdown from Defuddle API', async () => {
		const mockMarkdown = '# Example Article\n\nThis is content from the URL.';
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: async () => mockMarkdown,
		});

		const { fetchMarkdown } = await import('./index');
		const result = await fetchMarkdown('https://example.com/article');

		expect(mockFetch).toHaveBeenCalledWith(
			'https://defuddle.md/example.com/article',
			expect.objectContaining({
				signal: expect.any(AbortSignal),
			})
		);
		expect(result).toBe(mockMarkdown);
	});

	it('strips protocol from URL before fetching', async () => {
		const mockMarkdown = 'Content';
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: async () => mockMarkdown,
		});

		const { fetchMarkdown } = await import('./index');
		await fetchMarkdown('https://example.com/path');

		expect(mockFetch).toHaveBeenCalledWith(
			'https://defuddle.md/example.com/path',
			expect.any(Object)
		);
	});

	it('throws error on non-OK response', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 404,
			statusText: 'Not Found',
		});

		const { fetchMarkdown } = await import('./index');

		await expect(fetchMarkdown('https://example.com/notfound')).rejects.toThrow(
			'Defuddle error: 404 Not Found'
		);
	});
});
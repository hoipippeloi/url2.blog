import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '$lib/server/database';

vi.mock('$lib/server/database', () => ({
	prisma: {
		savedUrl: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
		},
		blogPost: {
			create: vi.fn(),
			update: vi.fn(),
		},
	},
}));

vi.mock('$lib/llm-gateway', () => ({
	llmClient: {
		generateBlogPost: vi.fn(),
	},
}));

vi.mock('$lib/defuddle', () => ({
	fetchMarkdown: vi.fn(),
}));

describe('URLs Page Server Load', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns saved URLs with blog post status', async () => {
		const mockUrls = [
			{
				id: 'url-1',
				url: 'https://example.com',
				createdAt: new Date(),
				blogPosts: [{ id: 'post-1', title: 'Test Post', content: 'content' }],
			},
			{
				id: 'url-2',
				url: 'https://another.com',
				createdAt: new Date(),
				blogPosts: [],
			},
		];

		vi.mocked(prisma.savedUrl.findMany).mockResolvedValue(mockUrls as any);

		const { load } = await import('./+page.server');
		const result = await load();

		expect(prisma.savedUrl.findMany).toHaveBeenCalledWith({
			include: { blogPosts: { orderBy: { createdAt: 'desc' }, take: 1 } },
			orderBy: { createdAt: 'desc' },
		});

		expect(result.savedUrls).toHaveLength(2);
		expect(result.savedUrls[0]).toHaveProperty('hasBlogPost', true);
		expect(result.savedUrls[1]).toHaveProperty('hasBlogPost', false);
	});

	it('returns empty array when no URLs saved', async () => {
		vi.mocked(prisma.savedUrl.findMany).mockResolvedValue([]);

		const { load } = await import('./+page.server');
		const result = await load();

		expect(result.savedUrls).toHaveLength(0);
	});
});
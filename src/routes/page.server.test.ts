import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '$lib/server/database';
import { llmClient } from '$lib/llm-gateway';

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

async function getActions() {
	const module = await import('./+page.server');
	return module.actions;
}

describe('Page Server Load', () => {
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

describe('saveUrl Action', () => {
	const createFormData = (url: string) => {
		const formData = new FormData();
		formData.append('url', url);
		return formData;
	};

	const createRequest = (formData: FormData) => {
		return { request: { formData: async () => formData } } as any;
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('saves valid URL and returns success', async () => {
		const formData = createFormData('https://example.com');
		const mockSavedUrl = {
			id: 'new-id',
			url: 'https://example.com',
			createdAt: new Date(),
		};

		vi.mocked(prisma.savedUrl.findUnique).mockResolvedValue(null);
		vi.mocked(prisma.savedUrl.create).mockResolvedValue(mockSavedUrl as any);

		const actions = await getActions();
		const result = await actions.saveUrl(createRequest(formData));

		expect(result).toEqual({
			type: 'success',
			data: { id: 'new-id', url: 'https://example.com', exists: false },
			message: 'URL saved successfully',
		});
	});

	it('returns existing URL when duplicate detected', async () => {
		const formData = createFormData('https://example.com');
		const existingUrl = {
			id: 'existing-id',
			url: 'https://example.com',
			createdAt: new Date(),
		};

		vi.mocked(prisma.savedUrl.findUnique).mockResolvedValue(existingUrl as any);

		const actions = await getActions();
		const result = await actions.saveUrl(createRequest(formData));

		expect(result).toEqual({
			type: 'success',
			data: { id: 'existing-id', url: 'https://example.com', exists: true },
			message: 'This URL already exists in your collection',
		});
		expect(prisma.savedUrl.create).not.toHaveBeenCalled();
	});

	it('rejects invalid URL format', async () => {
		const formData = createFormData('not-a-url');

		const actions = await getActions();
		const result = await actions.saveUrl(createRequest(formData));

		expect(result).toHaveProperty('status', 400);
		expect(result).toHaveProperty('data.error');
		expect(prisma.savedUrl.findUnique).not.toHaveBeenCalled();
		expect(prisma.savedUrl.create).not.toHaveBeenCalled();
	});

	it('returns error on database failure', async () => {
		const formData = createFormData('https://example.com');

		vi.mocked(prisma.savedUrl.findUnique).mockRejectedValue(new Error('DB error'));

		const actions = await getActions();
		const result = await actions.saveUrl(createRequest(formData));

		expect(result).toHaveProperty('status', 500);
		expect(result).toHaveProperty('data.error');
	});
});

describe('generateBlog Action', () => {
	const createFormData = (data: Record<string, string>) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			formData.append(key, value);
		});
		return formData;
	};

	const createRequest = (formData: FormData) => {
		return { request: { formData: async () => formData } } as any;
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('generates blog post successfully', async () => {
		const formData = createFormData({
			savedUrlId: 'url-1',
			title: 'Test Post',
			blogReason: 'Testing',
			tone: 'Professional',
			format: 'Tutorial',
			tags: 'test,vitest',
			category: 'Technology',
			additionalInstructions: '',
		});

		const mockSavedUrl = {
			id: 'url-1',
			url: 'https://example.com',
			createdAt: new Date(),
		};

		const mockBlogPost = {
			id: 'post-1',
			title: 'Test Post',
			content: '---\ntitle: Test Post\ntags: [test, vitest]\ncategory: Technology\n---\n\nGenerated content',
			frontmatter: { title: 'Test Post', tags: ['test', 'vitest'], category: 'Technology' },
		};

		vi.mocked(prisma.savedUrl.findUnique).mockResolvedValue(mockSavedUrl as any);
		vi.mocked(llmClient.generateBlogPost).mockResolvedValue(mockBlogPost.content);
		vi.mocked(prisma.blogPost.create).mockResolvedValue(mockBlogPost as any);

		const actions = await getActions();
		const result = await actions.generateBlog(createRequest(formData));

		expect(llmClient.generateBlogPost).toHaveBeenCalledWith(
			expect.objectContaining({
				url: 'https://example.com',
				title: 'Test Post',
				blogReason: 'Testing',
				tone: 'Professional',
				format: 'Tutorial',
				tags: ['test', 'vitest'],
				category: 'Technology',
			})
		);

		expect(result).toEqual({
			type: 'success',
			data: { id: 'post-1', content: mockBlogPost.content, title: 'Test Post' },
			message: 'Blog post generated successfully',
		});
	});

	it('returns 404 when URL not found', async () => {
		const formData = createFormData({
			savedUrlId: 'nonexistent',
			title: 'Test',
			blogReason: 'Testing',
			tone: 'Professional',
			format: 'Tutorial',
			tags: '',
			category: 'Technology',
			additionalInstructions: '',
		});

		vi.mocked(prisma.savedUrl.findUnique).mockResolvedValue(null);

		const actions = await getActions();
		const result = await actions.generateBlog(createRequest(formData));

		expect(result).toHaveProperty('status', 404);
		expect((result as any).data.error).toBe('URL not found');
	});

	it('returns error when LLM generates empty content', async () => {
		const formData = createFormData({
			savedUrlId: 'url-1',
			title: 'Test',
			blogReason: 'Testing',
			tone: 'Professional',
			format: 'Tutorial',
			tags: '',
			category: 'Technology',
			additionalInstructions: '',
		});

		const mockSavedUrl = { id: 'url-1', url: 'https://example.com', createdAt: new Date() };

		vi.mocked(prisma.savedUrl.findUnique).mockResolvedValue(mockSavedUrl as any);
		vi.mocked(llmClient.generateBlogPost).mockResolvedValue('');

		const actions = await getActions();
		const result = await actions.generateBlog(createRequest(formData));

		expect(result).toHaveProperty('status', 500);
		expect((result as any).data.error).toContain('Could not generate');
	});

	it('returns timeout error when LLM times out', async () => {
		const formData = createFormData({
			savedUrlId: 'url-1',
			title: 'Test',
			blogReason: 'Testing',
			tone: 'Professional',
			format: 'Tutorial',
			tags: '',
			category: 'Technology',
			additionalInstructions: '',
		});

		const mockSavedUrl = { id: 'url-1', url: 'https://example.com', createdAt: new Date() };

		vi.mocked(prisma.savedUrl.findUnique).mockResolvedValue(mockSavedUrl as any);
		vi.mocked(llmClient.generateBlogPost).mockRejectedValue(new Error('timeout exceeded'));

		const actions = await getActions();
		const result = await actions.generateBlog(createRequest(formData));

		expect(result).toHaveProperty('status', 408);
		expect((result as any).data.error).toContain('timed out');
	});

	it('validates required fields', async () => {
		const formData = createFormData({
			savedUrlId: 'url-1',
			title: '',
			blogReason: '',
			tone: '',
			format: '',
			tags: '',
			category: '',
			additionalInstructions: '',
		});

		const actions = await getActions();
		const result = await actions.generateBlog(createRequest(formData));

		expect(result).toHaveProperty('status', 400);
		expect(prisma.savedUrl.findUnique).not.toHaveBeenCalled();
	});
});

describe('saveBlogPost Action', () => {
	const createFormData = (data: Record<string, string>) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			formData.append(key, value);
		});
		return formData;
	};

	const createRequest = (formData: FormData) => {
		return { request: { formData: async () => formData } } as any;
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('saves blog post changes', async () => {
		const formData = createFormData({
			blogPostId: 'post-1',
			title: 'Updated Title',
			content: 'Updated content',
		});

		const mockUpdated = {
			id: 'post-1',
			title: 'Updated Title',
			content: 'Updated content',
		};

		vi.mocked(prisma.blogPost.update).mockResolvedValue(mockUpdated as any);

		const actions = await getActions();
		const result = await actions.saveBlogPost(createRequest(formData));

		expect(result).toEqual({
			type: 'success',
			data: { id: 'post-1', content: 'Updated content', title: 'Updated Title' },
			message: 'Blog post saved successfully',
		});
	});

	it('rejects empty content', async () => {
		const formData = createFormData({
			blogPostId: 'post-1',
			title: 'Title',
			content: '',
		});

		const actions = await getActions();
		const result = await actions.saveBlogPost(createRequest(formData));

		expect(result).toHaveProperty('status', 400);
		expect(prisma.blogPost.update).not.toHaveBeenCalled();
	});

	it('rejects empty title', async () => {
		const formData = createFormData({
			blogPostId: 'post-1',
			title: '',
			content: 'Some content',
		});

		const actions = await getActions();
		const result = await actions.saveBlogPost(createRequest(formData));

		expect(result).toHaveProperty('status', 400);
	});
});
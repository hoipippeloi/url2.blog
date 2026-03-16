import { fail } from '@sveltejs/kit';
import { urlSchema, blogGenerationSchema } from '$lib/validators';
import { prisma } from '$lib/server/database';
import { llmClient } from '$lib/llm-gateway';
import { fetchMarkdown } from '$lib/defuddle';

export const load = async () => {
	// Home page doesn't need to load saved URLs
	return {};
};

export const actions = {
	saveUrl: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const url = formData.get('url') as string;

		const validation = urlSchema.safeParse({ url });

		if (!validation.success) {
			return fail(400, {
				error: validation.error.errors[0].message,
				url,
			});
		}

		try {
			const existingUrl = await prisma.savedUrl.findUnique({
				where: { url: validation.data.url },
			});

			if (existingUrl) {
				return {
					type: 'success' as const,
					data: {
						id: existingUrl.id,
						url: existingUrl.url,
						markdownContent: existingUrl.markdownContent,
						exists: true,
					},
					message: 'This URL already exists in your collection',
				};
			}

			let markdownContent: string | null = null;
			try {
				markdownContent = await fetchMarkdown(validation.data.url);
			} catch (error) {
				console.warn('Failed to fetch markdown from Defuddle:', error);
			}

			const savedUrl = await prisma.savedUrl.create({
				data: {
					url: validation.data.url,
					markdownContent,
				},
			});

			return {
				type: 'success' as const,
				data: {
					id: savedUrl.id,
					url: savedUrl.url,
					markdownContent: savedUrl.markdownContent,
					exists: false,
				},
				message: 'URL saved successfully',
			};
		} catch (error) {
			console.error('Database error:', error);
			return fail(500, {
				error: 'Unable to save. Please check your connection and retry.',
				url,
			});
		}
	},

	generateBlog: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const savedUrlId = formData.get('savedUrlId') as string;
		const title = formData.get('title') as string;
		const blogReason = formData.get('blogReason') as string;
		const tone = formData.get('tone') as string;
		const format = formData.get('format') as string;
		const tags = (formData.get('tags') as string)?.split(',').map((t) => t.trim());
		const category = formData.get('category') as string;
		const additionalInstructions = formData.get('additionalInstructions') as string;

		const validation = blogGenerationSchema.safeParse({
			savedUrlId,
			title,
			blogReason,
			tone,
			format,
			tags,
			category,
			additionalInstructions,
		});

		if (!validation.success) {
			return fail(400, {
				error: validation.error.errors[0]?.message || 'Invalid form data',
				savedUrlId,
			});
		}

		try {
			const savedUrl = await prisma.savedUrl.findUnique({
				where: { id: savedUrlId },
			});

			if (!savedUrl) {
				return fail(404, {
					error: 'URL not found',
					savedUrlId,
				});
			}

			const content = await llmClient.generateBlogPost({
				url: savedUrl.url,
				title,
				blogReason,
				tone,
				format,
				tags,
				category,
				additionalInstructions,
			});

			if (!content || content.trim().length === 0) {
				return fail(500, {
					error: 'Could not generate content. Please try again or adjust your instructions.',
					savedUrlId,
				});
			}

			const frontmatter = extractFrontmatter(content);

			const blogPost = await prisma.blogPost.create({
				data: {
					savedUrlId,
					title: frontmatter.title || title,
					content,
					frontmatter: {
						title: frontmatter.title || title,
						tags: frontmatter.tags || tags,
						category: frontmatter.category || category,
						tone,
						format,
					},
					tone,
					format,
					category,
					tags,
					blogReason,
					additionalInstructions,
				},
			});

			return {
				type: 'success' as const,
				data: {
					id: blogPost.id,
					content,
					title: blogPost.title,
				},
				message: 'Blog post generated successfully',
			};
		} catch (error) {
			console.error('Generation error:', error);

			if (error instanceof Error && error.message.includes('timeout')) {
				return fail(408, {
					error: 'Generation timed out. Please retry.',
					savedUrlId,
				});
			}

			return fail(500, {
				error: 'Failed to generate blog post',
				savedUrlId,
			});
		}
	},

	saveBlogPost: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const blogPostId = formData.get('blogPostId') as string;
		const content = formData.get('content') as string;
		const title = formData.get('title') as string;

		if (!content || !title) {
			return fail(400, {
				error: 'Content and title are required',
			});
		}

		try {
			const updated = await prisma.blogPost.update({
				where: { id: blogPostId },
				data: {
					content,
					title,
				},
			});

			return {
				type: 'success' as const,
				data: {
					id: updated.id,
					content: updated.content,
					title: updated.title,
				},
				message: 'Blog post saved successfully',
			};
		} catch (error) {
			console.error('Save error:', error);
			return fail(500, {
				error: 'Unable to save changes. Please retry.',
			});
		}
	},
};

function extractFrontmatter(content: string) {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		return {
			title: '',
			tags: [],
			category: '',
		};
	}

	const frontmatterString = match[1];
	const titleMatch = frontmatterString.match(/title:\s*(.+)/);
	const tagsMatch = frontmatterString.match(/tags:\s*\[(.+?)\]/);
	const categoryMatch = frontmatterString.match(/category:\s*(.+)/);

	return {
		title: titleMatch ? titleMatch[1].trim() : '',
		tags: tagsMatch ? tagsMatch[1].split(',').map((t) => t.trim()) : [],
		category: categoryMatch ? categoryMatch[1].trim() : '',
	};
}
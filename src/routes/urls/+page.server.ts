import { fail } from '@sveltejs/kit';
import { blogGenerationSchema } from '$lib/validators';
import { prisma } from '$lib/server/database';
import { llmClient } from '$lib/llm-gateway';

export const load = async () => {
	const savedUrls = await prisma.savedUrl.findMany({
		include: {
			blogPosts: {
				orderBy: {
					createdAt: 'desc',
				},
				take: 1,
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	return {
		savedUrls: savedUrls.map((url) => ({
			id: url.id,
			url: url.url,
			title: url.title,
			createdAt: url.createdAt,
			hasBlogPost: url.blogPosts.length > 0,
			latestBlogPost: url.blogPosts[0],
		})),
	};
};

export const actions = {
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

	deleteUrl: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const savedUrlId = formData.get('savedUrlId') as string;

		if (!savedUrlId) {
			return fail(400, {
				error: 'URL ID is required',
			});
		}

		try {
			await prisma.savedUrl.delete({
				where: { id: savedUrlId },
			});

			return {
				type: 'success' as const,
				message: 'URL deleted successfully',
			};
		} catch (error) {
			console.error('Delete error:', error);
			return fail(500, {
				error: 'Unable to delete URL. Please retry.',
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

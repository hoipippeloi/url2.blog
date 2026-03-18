import { prisma } from '$lib/server/database';
import { error } from '@sveltejs/kit';

export const load = async ({ params }: { params: { id: string } }) => {
	const savedUrl = await prisma.savedUrl.findUnique({
		where: { id: params.id },
		include: {
			blogPosts: {
				orderBy: {
					createdAt: 'desc',
				},
				take: 1,
			},
		},
	});

	if (!savedUrl || savedUrl.blogPosts.length === 0) {
		throw error(404, 'Blog post not found');
	}

	const blogPost = savedUrl.blogPosts[0];

	return {
		blogPost: {
			id: blogPost.id,
			title: blogPost.title,
			content: blogPost.content,
			frontmatter: blogPost.frontmatter,
			createdAt: blogPost.createdAt,
		},
		savedUrl: {
			id: savedUrl.id,
			url: savedUrl.url,
			title: savedUrl.title,
		},
	};
};

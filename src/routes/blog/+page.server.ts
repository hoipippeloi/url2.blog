import { prisma } from '$lib/server/database';

export const load = async () => {
	const savedUrlsWithBlogPosts = await prisma.savedUrl.findMany({
		where: {
			blogPosts: {
				some: {},
			},
		},
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
		savedUrls: savedUrlsWithBlogPosts.map((url) => ({
			id: url.id,
			url: url.url,
			title: url.title,
			createdAt: url.createdAt,
			hasBlogPost: true,
			latestBlogPost: url.blogPosts[0],
		})),
	};
};

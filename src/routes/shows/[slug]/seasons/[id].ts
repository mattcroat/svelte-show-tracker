import type { RequestHandler } from '@sveltejs/kit'
import { getEpisodes } from '$lib/api'

export const get: RequestHandler = async ({ params }) => {
	const name = params.slug
	const season = +params.id

	return {
		body: {
			episodes: await getEpisodes(name, season)
		}
	}
}

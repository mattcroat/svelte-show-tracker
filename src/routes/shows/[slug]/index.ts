import type { RequestHandler } from '@sveltejs/kit'
import { getSeasons } from '$lib/api'

export const get: RequestHandler = async ({ params }) => {
	const { name, seasons } = await getSeasons(params.slug)

	return {
		body: { name, seasons }
	}
}

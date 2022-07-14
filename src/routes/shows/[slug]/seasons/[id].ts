import type { RequestHandler } from '@sveltejs/kit'
import { completeEpisode, getEpisodes } from '$lib/api'

export const get: RequestHandler = async ({ params }) => {
	const name = params.slug
	const season = +params.id

	return {
		body: {
			episodes: await getEpisodes(name, season)
		}
	}
}

export const post: RequestHandler = async ({ request }) => {
	const form = await request.formData()
	const id = String(form.get('id'))

	await completeEpisode(id)

	return {}
}

import { completeEpisode, getEpisodes } from '$lib/api'
import invariant from 'tiny-invariant'
import type { RequestHandler } from '@sveltejs/kit'

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
	const id = form.get('id')

	invariant(typeof id === 'string', 'id must be a string')

	await completeEpisode(id)

	return {}
}

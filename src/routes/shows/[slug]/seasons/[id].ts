import { episodeCompleted, getEpisodes } from '$lib/api'
import invariant from 'tiny-invariant'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ params }) => {
	return {
		body: {
			episodes: await getEpisodes(params.slug)
		}
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData()
	const id = form.get('id')

	invariant(typeof id === 'string', 'id must be a string')

	await episodeCompleted(id)

	return {}
}

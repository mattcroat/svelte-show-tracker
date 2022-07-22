import invariant from 'tiny-invariant'
import { getSeasons, seasonCompleted } from '$lib/api'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ params }) => {
	const { show, seasons } = await getSeasons(params.slug)

	return {
		body: { show, seasons }
	}
}

export const POST: RequestHandler = async ({ request, params }) => {
	const form = await request.formData()
	const seasonId = form.get('season_id')

	invariant(typeof seasonId === 'string', 'seasonId must be a string')

	await seasonCompleted(seasonId, params.slug)

	return {}
}

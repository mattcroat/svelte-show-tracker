import invariant from 'tiny-invariant'
import { completeSeason, getSeasons } from '$lib/api'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ params }) => {
	const { show, seasons } = await getSeasons(params.slug)

	return {
		body: { show, seasons }
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData()
	const seasonId = form.get('season_id')
	const seasonNumber = Number(form.get('season'))

	invariant(typeof seasonId === 'string', 'seasonId must be a string')
	invariant(typeof seasonNumber === 'number', 'season must be a number')

	await completeSeason(seasonId, seasonNumber)

	return {}
}

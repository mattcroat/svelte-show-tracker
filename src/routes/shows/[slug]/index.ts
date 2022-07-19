import invariant from 'tiny-invariant'
import { completeSeason, getSeasons } from '$lib/api'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ params }) => {
	const { name, seasons } = await getSeasons(params.slug)

	return {
		body: { name, seasons }
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData()
	const id = form.get('id')

	invariant(typeof id === 'string', 'id must be a string')

	await completeSeason(id)

	return {}
}

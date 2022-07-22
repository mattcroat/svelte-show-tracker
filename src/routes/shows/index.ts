import invariant from 'tiny-invariant'
import { getShows, showCompleted } from '$lib/api'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
	return {
		body: { shows: await getShows() }
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData()
	const slug = form.get('slug')

	invariant(typeof slug === 'string', 'slug must be a string')

	await showCompleted(slug)

	return {}
}

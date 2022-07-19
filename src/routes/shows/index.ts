import invariant from 'tiny-invariant'
import { completeShow, getShows } from '$lib/api'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
	return {
		body: { shows: await getShows() }
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData()
	const id = form.get('id')

	invariant(typeof id === 'string', 'id must be a string')

	await completeShow(id)

	return {}
}

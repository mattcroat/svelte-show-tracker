import type { RequestHandler } from '@sveltejs/kit'
import { completeShow, getShows } from '$lib/api'

export const get: RequestHandler = async () => {
	return {
		body: { shows: await getShows() }
	}
}

export const post: RequestHandler = async ({ request }) => {
	const form = await request.formData()
	const id = String(form.get('id'))

	await completeShow(id)

	return {}
}

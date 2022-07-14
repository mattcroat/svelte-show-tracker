import type { RequestHandler } from '@sveltejs/kit'
import { completeSeason, getSeasons } from '$lib/api'

export const get: RequestHandler = async ({ params }) => {
	const { name, seasons } = await getSeasons(params.slug)

	return {
		body: { name, seasons }
	}
}

export const post: RequestHandler = async ({ request }) => {
	const form = await request.formData()
	const id = String(form.get('id'))

	await completeSeason(id)

	return {}
}

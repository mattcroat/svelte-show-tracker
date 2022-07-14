import type { RequestHandler } from '@sveltejs/kit'
import { addShowToDatabase, getSearchResults } from '$lib/api'

let results = []

export const get: RequestHandler = async () => {
	return {
		body: { results }
	}
}

export const post: RequestHandler = async ({ request }) => {
	const form = await request.formData()

	const search = form.has('search')
	const name = String(form.get('show'))

	const add = form.has('add')
	const id = String(form.get('id'))

	if (search) {
		results = await getSearchResults(name)
	}

	if (add) {
		await addShowToDatabase(id)
	}

	return {}
}

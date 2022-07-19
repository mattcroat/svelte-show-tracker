import invariant from 'tiny-invariant'
import { addShowToDatabase, getSearchResults } from '$lib/api'
import type { RequestHandler } from '@sveltejs/kit'
import type { SearchResult } from '$lib/types'

let results: SearchResult[] = []

export const get: RequestHandler = async () => {
	return {
		body: { results }
	}
}

export const post: RequestHandler = async ({ request }) => {
	const form = await request.formData()

	if (form.has('search')) {
		const name = form.get('show')
		invariant(typeof name === 'string', 'name must be a string')
		results = await getSearchResults(name)
	}

	if (form.has('add')) {
		const id = form.get('id')
		invariant(typeof id === 'string', 'id must be a string')
		await addShowToDatabase(id)
	}

	return {}
}

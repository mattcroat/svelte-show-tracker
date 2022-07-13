import type { RequestHandler } from '@sveltejs/kit'
import { db } from '$lib/database/prisma'

let results = []

export const get: RequestHandler = async () => {
	return {
		body: { results }
	}
}

export const post: RequestHandler = async ({ request }) => {
	const form = await request.formData()
	const search = form.has('show_search')
	const query = form.get('search_query')
	const add = form.has('show_add')
	const id = form.get('id')

	if (search) {
		const response = await fetch(
			`https://api.tvmaze.com/search/shows?q=${query}`
		)
		const data = await response.json()

		results = await Promise.all(
			data.map(async ({ show }) => {
				return {
					id: show.id,
					name: show.name,
					image: show.image.medium,
					added: Boolean(
						await db.show.findFirst({ where: { name: show.name } })
					)
				}
			})
		)
	}

	if (add) {
		const response = await fetch(
			`https://api.tvmaze.com/shows/${id}?embed[]=seasons&embed[]=episodes`
		)
		const data = await response.json()

		const exists = await db.show.findFirst({ where: { name: data.name } })
		if (exists) {
			throw new Error(`${data.name} already exists!`)
		}

		const show = {
			name: data.name,
			slug: data.name.toLowerCase().split(' ').join('-'),
			image: data.image.medium,
			updated: data.updated,
			seasons: {
				create: data._embedded.seasons.map((season) => {
					return {
						number: season.number,
						image: season.image.medium,
						episodes: {
							create: data._embedded.episodes
								.filter((episode) => episode.season === season.number)
								.map((episode) => {
									return {
										name: episode.name,
										number: episode.number,
										image: episode.image.medium
									}
								})
						}
					}
				})
			}
		}

		await db.show.create({ data: show })
	}

	return {}
}

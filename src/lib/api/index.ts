import { db } from '$lib/database/prisma'

const base = 'https://api.tvmaze.com'

async function api(url: string) {
	try {
		const response = await fetch(`${base}${url}`)

		if (!response.ok) {
			const message = await response.text()
			throw new Error(message)
		}

		return await response.json()
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message)
		}
	}
}

export async function getSearchResults(name: string) {
	const data = await api(`/search/shows?q=${name}`)

	return await Promise.all(
		data.map(async ({ show }) => {
			return {
				id: show.id,
				name: show.name,
				image: show.image.medium,
				added: Boolean(await db.show.findFirst({ where: { name: show.name } }))
			}
		})
	)
}

export async function addShowToDatabase(id: string) {
	const data = await api(`/shows/${id}?embed[]=seasons&embed[]=episodes`)
	const added = Boolean(await db.show.count({ where: { name: data.name } }))

	if (added) {
		throw new Error(`${data.name} already exists.`)
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

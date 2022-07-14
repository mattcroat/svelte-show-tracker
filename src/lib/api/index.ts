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
									show: data.name,
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

export async function getShows() {
	return await db.show.findMany()
}

export async function getSeasons(slug: string) {
	const show = await db.show.findFirst({
		where: { slug },
		select: { name: true, seasons: true }
	})

	if (!show) {
		throw new Error('Could not find show.')
	}

	return {
		name: show.name,
		seasons: show.seasons
	}
}

export async function completeShow(id: string) {
	const show = await db.show.findUnique({
		where: { id },
		select: { name: true, completed: true }
	})

	if (!show) {
		throw new Error('Could not find show.')
	}

	await db.show.update({
		where: { id },
		data: { completed: !show.completed }
	})

	await db.season.updateMany({
		where: { showId: id },
		data: { completed: !show.completed }
	})

	await db.episode.updateMany({
		where: { show: show.name },
		data: { completed: !show.completed }
	})
}

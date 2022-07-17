// todo: rename prisma.ts to index.ts
import type { z } from 'zod'

import { db } from '$lib/database/prisma'
import { validateSearchResults } from '$lib/validation'

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
	const searchResults: Show[] = await api(`/search/shows?q=${name}`)

	// todo: catch error
	const validatedResults = validateSearchResults(searchResults)
	type Show = z.infer<typeof validatedResults>

	// todo: I hate this syntax
	return await Promise.all(
		searchResults.map(async ({ show }) => {
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
	// https://api.tvmaze.com/shows/2993?embed[]=seasons&embed[]=episodes
	const data = await api(`/shows/${id}?embed[]=seasons&embed[]=episodes`)
	const added = Boolean(await db.show.count({ where: { name: data.name } }))

	if (added) {
		throw new Error(`${data.name} already exists.`)
	}

	// const show = {
	// 	name: data.name,
	// 	slug: data.name.toLowerCase().split(' ').join('-'),
	// 	image: data.image.medium,
	// 	updated: data.updated,
	// 	seasons: {
	// 		create: data._embedded.seasons
	// 			.filter((season) => Boolean(season.premiereDate))
	// 			.map((season) => {
	// 				return {
	// 					number: season.number,
	// 					image: season.image.medium,
	// 					episodes: {
	// 						create: data._embedded.episodes
	// 							.filter((episode) => episode.season === season.number)
	// 							.map((episode) => {
	// 								return {
	// 									show: data.name,
	// 									name: episode.name,
	// 									number: episode.number,
	// 									image: episode.image.medium
	// 								}
	// 							})
	// 					}
	// 				}
	// 			})
	// 	}
	// }

	// await db.show.create({ data: show })

	const show = {
		name: data.name,
		slug: data.name.toLowerCase().split(' ').join('-'),
		image: data.image.medium,
		updated: data.updated
	}

	const seasons = data._embedded.seasons
		.filter((season) => Boolean(season.premiereDate))
		.map((season) => ({
			number: season.number,
			image: season.image.medium
		}))

	const episodes = data._embedded.episodes.map((episode) => ({
		season: episode.season,
		name: episode.name,
		number: episode.number,
		image: episode.image.medium
	}))

	await db.show.create({
		data: {
			...show,
			seasons: { create: seasons },
			episodes: { create: episodes }
		}
	})
}

export async function getShows() {
	// todo: only return what's required
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

export async function getEpisodes(name: string, season: number) {
	const show = await db.show.findUnique({
		where: { slug: name },
		select: {
			episodes: {
				where: { season }
			}
		}
	})

	if (!show) {
		throw new Error('Could not find show.')
	}

	return show.episodes
}

export async function completeShow(id: string) {
	const show = await db.show.findUnique({
		where: { id },
		select: { completed: true }
	})

	if (!show) {
		throw new Error('Could not find show.')
	}

	await db.show.update({
		where: { id },
		data: {
			completed: !show.completed,
			seasons: {
				updateMany: {
					where: { showId: id },
					data: { completed: !show.completed }
				}
			},
			episodes: {
				updateMany: {
					where: { showId: id },
					data: { completed: !show.completed }
				}
			}
		}
	})
}

export async function completeSeason(id: string) {
	const season = await db.season.findUnique({
		where: { id },
		select: { number: true, completed: true }
	})

	if (!season) {
		throw new Error('Could not find season.')
	}

	await db.season.update({
		where: { id },
		data: { completed: !season.completed }
	})

	await db.episode.updateMany({
		where: { season: season.number },
		data: { completed: !season.completed }
	})
}

export async function completeEpisode(id: string) {
	const episode = await db.episode.findUnique({
		where: { id },
		select: { completed: true }
	})

	if (!episode) {
		throw new Error('Could not find episode.')
	}

	await db.episode.update({
		where: { id },
		data: { completed: !episode.completed }
	})
}

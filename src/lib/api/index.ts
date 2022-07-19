import invariant from 'tiny-invariant'
import { db } from '$lib/database'
import { validateSearchResults, validateShow } from '$lib/validation'
import type { z } from 'zod'

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

const placeholder = {
	show: 'https://via.placeholder.com/210x295?text=Placeholder',
	episode: 'https://via.placeholder.com/250x140?text=Placeholder'
}

export async function getSearchResults(name: string) {
	const searchResults: Show[] = await api(`/search/shows?q=${name}`)

	const validatedResults = validateSearchResults(searchResults)
	type Show = z.infer<typeof validatedResults>

	return await Promise.all(
		searchResults.map(async ({ show }) => {
			return {
				id: show.id,
				name: show.name,
				image: show.image?.medium ?? placeholder.show,
				added: Boolean(await db.show.findFirst({ where: { name: show.name } }))
			}
		})
	)
}

export async function addShowToDatabase(id: string) {
	// https://api.tvmaze.com/shows/2993?embed[]=seasons&embed[]=episodes
	const data: Show = await api(`/shows/${id}?embed[]=seasons&embed[]=episodes`)
	const added = Boolean(await db.show.count({ where: { name: data.name } }))

	invariant(!added, `${data.name} already exists.`)

	const validatedShow = validateShow(data)
	type Show = z.infer<typeof validatedShow>

	const show = {
		name: data.name,
		slug: data.name.toLowerCase().split(' ').join('-'),
		image: data.image?.medium ?? placeholder.show,
		updated: data.updated
	}

	const seasons = data._embedded.seasons
		.filter((season) => Boolean(season.premiereDate))
		.map((season) => ({
			number: season.number,
			image: season.image?.medium ?? placeholder.show
		}))

	const episodes = data._embedded.episodes.map((episode) => ({
		season: episode.season,
		name: episode.name,
		number: episode.number,
		image: episode.image?.medium ?? placeholder.episode
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
	return await db.show.findMany({
		select: {
			name: true,
			slug: true,
			image: true,
			completed: true,
			updated: true
		}
	})
}

export async function getSeasons(slug: string) {
	const show = await db.show.findFirst({
		where: { slug },
		select: { name: true, seasons: true }
	})

	invariant(show, 'Could not find show.')

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

	invariant(show, 'Could not find show.')

	return show.episodes
}

export async function completeShow(id: string) {
	const show = await db.show.findUnique({
		where: { id },
		select: { completed: true }
	})

	invariant(show, 'Could not find show.')

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

	invariant(season, 'Could not find season.')

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

	invariant(episode, 'Could not find episode.')

	await db.episode.update({
		where: { id },
		data: { completed: !episode.completed }
	})
}

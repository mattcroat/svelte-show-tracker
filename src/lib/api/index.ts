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

export async function getSearchResults(showName: string) {
	const searchResults: Show[] = await api(`/search/shows?q=${showName}`)

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

export async function addShowToDatabase(showId: string) {
	// https://api.tvmaze.com/shows/2993?embed[]=seasons&embed[]=episodes
	const data: Show = await api(
		`/shows/${showId}?embed[]=seasons&embed[]=episodes`
	)
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

	const stats = {
		episodes: data._embedded.episodes.length
	}

	await db.show.create({
		data: {
			...show,
			seasons: { create: seasons },
			episodes: { create: episodes },
			stats: { create: stats }
		}
	})
}

export async function getShows() {
	return await db.show.findMany({
		include: { stats: true }
	})
}

export async function getSeasons(slug: string) {
	const show = await db.show.findFirst({
		where: { slug },
		include: { seasons: true }
	})

	invariant(show, 'Could not find show.')

	return {
		show: show.name,
		seasons: show.seasons
	}
}

export async function getEpisodes(slug: string, season: number) {
	const show = await db.show.findUnique({
		where: { slug },
		select: {
			episodes: {
				where: { season }
			}
		}
	})

	invariant(show, 'Could not find show.')

	return show.episodes
}

export async function completeShow(showId: string) {
	const show = await db.show.findUnique({
		where: { id: showId },
		select: { completed: true }
	})

	invariant(show, 'Could not find show.')

	await db.show.update({
		where: { id: showId },
		data: {
			completed: !show.completed,
			seasons: {
				updateMany: {
					where: { showId },
					data: { completed: !show.completed }
				}
			},
			episodes: {
				updateMany: {
					where: { showId },
					data: { completed: !show.completed }
				}
			}
		}
	})

	await updateStats(showId)
}

export async function completeSeason(seasonId: string, seasonNumber: number) {
	const season = await db.season.findUnique({
		where: { id: seasonId },
		select: { showId: true, completed: true }
	})

	invariant(season, 'Could not find season.')

	await db.season.update({
		where: { id: seasonId },
		data: { completed: !season.completed }
	})

	await db.episode.updateMany({
		where: { showId: season.showId, season: seasonNumber },
		data: {
			completed: !season.completed
		}
	})

	// const numberOfSeasons = await db.season.count({
	// 	where: { showId: season.showId }
	// })
	// const completedSeasons = await db.season.count({
	// 	where: { showId: season.showId, completed: true }
	// })
	// await db.show.update({
	// 	where: { id: season.showId },
	// 	data: { completed: numberOfSeasons === completedSeasons }
	// })

	await updateStats(season.showId)
}

export async function completeEpisode(episodeId: string) {
	const episode = await db.episode.findUnique({
		where: { id: episodeId },
		select: { completed: true, showId: true }
	})

	invariant(episode, 'Could not find episode.')

	await db.episode.update({
		where: { id: episodeId },
		data: { completed: !episode.completed }
	})

	await updateStats(episode.showId)
}

async function updateStats(showId: string) {
	const count = await db.episode.count({
		where: {
			showId,
			completed: { equals: true }
		}
	})

	await db.show.update({
		where: { id: showId },
		data: {
			stats: {
				update: { watched: count }
			}
		}
	})
}

export async function getStats(showId: string) {
	return await db.stats.findUnique({
		where: { showId }
	})
}

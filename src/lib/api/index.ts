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

	const slug = data.name.toLowerCase().split(' ').join('-')

	const show = {
		slug,
		name: data.name,
		image: data.image?.medium ?? placeholder.show,
		updated: data.updated
	}

	const seasons = data._embedded.seasons
		.filter((season) => Boolean(season.premiereDate))
		.map((season) => ({
			number: season.number,
			image: season.image?.medium ?? placeholder.show,
			episodeCount: season?.episodeOrder ?? 0
		}))

	const episodes = data._embedded.episodes.map((episode) => ({
		slug,
		name: episode.name,
		seasonNumber: episode.season,
		number: episode.number,
		image: episode.image?.medium ?? placeholder.episode
	}))

	const seasonsWithEpisodes = seasons.map((season) => ({
		...season,
		episodes: {
			create: episodes.filter(
				(episode) => episode.seasonNumber === season.number
			)
		}
	}))

	const stats = {
		episodes: data._embedded.episodes.length
	}

	await db.show.create({
		data: {
			...show,
			seasons: { create: seasonsWithEpisodes },
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

export async function getEpisodes(slug: string) {
	const episodes = await db.episode.findMany({ where: { slug } })
	return episodes
}

async function isShowCompleted(slug: string) {
	const show = await db.show.findUnique({
		where: { slug },
		select: { completed: true }
	})
	invariant(show, 'Could not find show.')
	return show.completed
}

export async function showCompleted(slug: string) {
	const completed = await isShowCompleted(slug)

	const query = {
		where: { slug },
		data: { completed: !completed }
	}

	await db.show.updateMany(query)
	await db.episode.updateMany(query)
	await updateStats(slug)
}

async function isSeasonCompleted(seasonId: string) {
	const season = await db.season.findUnique({
		where: { id: seasonId },
		select: { slug: true, completed: true }
	})
	invariant(season, 'Could not find season.')
	return season.completed
}

export async function seasonCompleted(seasonId: string, slug: string) {
	const completed = await isSeasonCompleted(seasonId)

	await db.season.update({
		where: { id: seasonId },
		data: { completed: !completed }
	})

	await db.episode.updateMany({
		where: { slug },
		data: { completed: !completed }
	})

	await updateStats(slug)
}

async function isEpisodeCompleted(episodeId: string) {
	const episode = await db.episode.findUnique({
		where: { id: episodeId },
		select: { completed: true }
	})
	invariant(episode, 'Could not find episode.')
	return episode.completed
}

export async function episodeCompleted(episodeId: string, slug: string) {
	const completed = await isEpisodeCompleted(episodeId)

	await db.episode.update({
		where: { id: episodeId },
		data: { completed: !completed }
	})

	await updateStats(slug)
}

async function updateStats(slug: string) {
	const count = await db.episode.count({
		where: {
			slug,
			completed: { equals: true }
		}
	})

	await db.show.update({
		where: { slug },
		data: {
			stats: {
				update: { watched: count }
			}
		}
	})
}

export async function getStats(showId: string) {
	return await db.stats.findUnique({
		where: { id: showId }
	})
}

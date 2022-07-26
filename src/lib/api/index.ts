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
		updated: data.updated,
		totalEpisodes: data._embedded.episodes.length
	}

	const seasons = data._embedded.seasons
		.filter((season) => Boolean(season.premiereDate))
		.map((season) => ({
			number: season.number,
			image: season.image?.medium ?? placeholder.show,
			// todo: should probably filter episodes without total episodes
			totalEpisodes: season.episodeOrder ?? 0
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

	await db.show.create({
		data: {
			...show,
			seasons: { create: seasonsWithEpisodes }
		}
	})
}

export async function getShows() {
	return await db.show.findMany({})
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

export async function showCompleted(slug: string) {
	const show = await db.show.findUnique({
		where: { slug },
		select: { completed: true, seasons: true, totalEpisodes: true }
	})

	invariant(show, 'Could not find show.')

	const query = {
		where: { slug },
		data: { completed: !show.completed }
	}

	// update show, season and episodes
	await db.show.updateMany(query)
	await db.season.updateMany(query)
	await db.episode.updateMany(query)

	// todo: update show episodes
	const completedEpisodes = show.completed ? 0 : show.totalEpisodes
	await db.show.update({
		where: { slug },
		data: { completedEpisodes }
	})
	// ...

	// update completed episodes
	for (const season of show.seasons) {
		const currentSeason = await db.season.findUnique({
			where: { id: season.id },
			select: { totalEpisodes: true }
		})

		invariant(currentSeason, 'Could not find season.')

		const completedEpisodes = show.completed ? 0 : currentSeason.totalEpisodes

		await db.season.update({
			where: { id: season.id },
			data: { completedEpisodes }
		})
	}
}

export async function seasonCompleted(seasonId: string, slug: string) {
	const season = await db.season.findUnique({
		where: { id: seasonId },
		select: { slug: true, completed: true, totalEpisodes: true }
	})

	invariant(season, 'Could not find season.')

	const completed = !season.completed
	const completedEpisodes = !season.completed ? season.totalEpisodes : 0

	await db.season.update({
		where: { id: seasonId },
		data: { completed, completedEpisodes }
	})

	await db.episode.updateMany({
		where: { slug },
		data: { completed: !season.completed }
	})

	// todo: update episodes for show
	const completedShowEpisodes = season.completed ? 0 : season.totalEpisodes
	await db.show.update({
		where: { slug: season.slug },
		data: { completedEpisodes: completedShowEpisodes }
	})
	// ...

	await isShowCompleted(slug)
}

export async function episodeCompleted(episodeId: string) {
	const episode = await db.episode.findUnique({
		where: { id: episodeId },
		select: { seasonId: true, completed: true, slug: true }
	})

	invariant(episode, 'Could not find episode.')

	await db.episode.update({
		where: { id: episodeId },
		data: { completed: !episode.completed }
	})

	// todo: update episodes for show
	const increment = { increment: 1 }
	const decrement = { decrement: 1 }
	await db.show.update({
		where: { slug: episode.slug },
		data: { completedEpisodes: episode.completed ? decrement : increment }
	})
	// ...

	await isSeasonCompleted(episode.seasonId, episode.completed)
	await isShowCompleted(episode.slug)
}

async function isShowCompleted(slug: string) {
	const numberOfSeasons = await db.season.count({
		where: { slug }
	})

	const completedSeasons = await db.season.count({
		where: {
			slug: slug,
			completed: { equals: true }
		}
	})

	const showCompleted = numberOfSeasons === completedSeasons

	await db.show.update({
		where: { slug: slug },
		data: { completed: showCompleted }
	})
}

async function isSeasonCompleted(seasonId: string, completed: boolean) {
	const increment = { increment: 1 }
	const decrement = { decrement: 1 }

	const seasonUpdate = await db.season.update({
		where: { id: seasonId },
		data: { completedEpisodes: !completed ? increment : decrement },
		select: { completedEpisodes: true, totalEpisodes: true, slug: true }
	})

	const seasonCompleted =
		seasonUpdate.completedEpisodes === seasonUpdate.totalEpisodes

	await db.season.update({
		where: { id: seasonId },
		data: { completed: seasonCompleted }
	})
}

import { z } from 'zod'

export function validateSearchResults(searchResults: unknown) {
	const showSchema = z.object({
		show: z.object({
			id: z.number(),
			name: z.string(),
			image: z.object({
				medium: z.string()
			})
		})
	})
	z.array(showSchema).parse(searchResults)
	return showSchema
}

export function validateShow(show: unknown) {
	const showSchema = z.object({
		name: z.string(),
		image: z
			.object({
				medium: z.string()
			})
			.or(z.null()),
		updated: z.number(),
		_embedded: z.object({
			seasons: z.array(
				z.object({
					number: z.number(),
					image: z
						.object({
							medium: z.string()
						})
						.or(z.null()),
					premiereDate: z.string().or(z.null())
				})
			),
			episodes: z.array(
				z.object({
					season: z.number(),
					name: z.string(),
					number: z.number(),
					image: z
						.object({
							medium: z.string()
						})
						.or(z.null())
				})
			)
		})
	})
	showSchema.parse(show)
	return showSchema
}

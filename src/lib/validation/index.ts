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

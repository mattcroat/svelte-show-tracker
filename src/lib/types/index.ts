import type { Prisma } from '@prisma/client'
import type { getShows } from '$lib/api'

export type SearchResult = {
	id: number
	name: string
	image: string
	added: boolean
}

// https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety
export type ShowsWithStats = Prisma.PromiseReturnType<typeof getShows>

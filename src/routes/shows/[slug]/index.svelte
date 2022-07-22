<script lang="ts">
	import { page } from '$app/stores'
	import { enhanceForm } from '$lib/actions/form'
	import type { Season } from '@prisma/client'

	export let show = 'Could not find name'
	export let seasons: Season[] = []

	const path = $page.url.pathname
</script>

<div class="grid">
	<h2 class="heading">{show}</h2>

	<section class="items">
		{#each seasons as { id, number, image, completed }}
			<article class="item">
				<a href="{path}/seasons/{number}">
					<img class="season" class:completed src={image} alt={show} />
				</a>

				<form method="post" use:enhanceForm>
					<input type="hidden" name="season_id" value={id} />
					<button aria-label="Mark as watched" type="submit">🍿</button>
				</form>
			</article>
		{/each}
	</section>
</div>

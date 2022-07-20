<script lang="ts">
	import { enhanceForm } from '$lib/actions/form'
	import { completion } from '$lib/utils'
	import type { ShowsWithStats } from '$lib/types'

	export let shows: ShowsWithStats = []
</script>

<div class="grid">
	<h2 class="heading">Shows</h2>

	{#if shows.length === 0}
		<p>Nothing to show here.</p>
	{/if}

	<section class="items">
		{#each shows as { id, name, slug, image, completed, stats }}
			<article class="item">
				<a href="/shows/{slug}">
					<img class="show" class:completed src={image} alt={name} />
				</a>

				<div class="stats">
					<span class="completion">
						{completion(stats.episodes, stats.watched)}
					</span>
				</div>

				<form method="post" use:enhanceForm>
					<input type="hidden" name="id" value={id} />
					<button aria-label="Mark as watched" type="submit">🍿</button>
				</form>
			</article>
		{/each}
	</section>
</div>

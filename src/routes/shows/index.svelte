<script lang="ts">
	import { enhanceForm } from '$lib/actions/form'
	import type { Show } from '@prisma/client'

	export let shows: Show[] = []
</script>

<div class="grid">
	<h2 class="heading">Shows</h2>

	<section class="items">
		{#each shows as { id, name, slug, image, completed }}
			<article class="item">
				<a href="/shows/{slug}" class:completed>
					<img class="show" src={image} alt={name} />
				</a>

				<form method="post" use:enhanceForm>
					<input type="hidden" name="id" value={id} />
					<button aria-label="Mark as watched" type="submit">🍿</button>
				</form>
			</article>
		{/each}
	</section>
</div>

<script lang="ts">
	import { page } from '$app/stores'
	import { enhanceForm } from '$lib/actions/form'

	export let name = 'Could not find name'
	export let seasons: any[] = []

	const path = $page.url.pathname
</script>

<div class="grid">
	<h2 class="heading">{name}</h2>

	<section class="items">
		{#each seasons as { id, number, image, completed }}
			<article class="item">
				<a href="{path}/seasons/{number}" class:completed>
					<img src={image} alt={name} />
				</a>

				<form method="post" use:enhanceForm>
					<input type="hidden" name="id" value={id} />
					<button aria-label="Mark as watched" type="submit">🍿</button>
				</form>
			</article>
		{/each}
	</section>
</div>

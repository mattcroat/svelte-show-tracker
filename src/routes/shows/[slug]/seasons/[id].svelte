<script lang="ts">
	import { enhanceForm } from '$lib/actions/form'

	export let episodes: any[] = []
</script>

<div class="grid">
	<h2 class="heading">Episodes</h2>

	<section class="items">
		{#each episodes as { id, name, number, image, completed }}
			{@const episodeNumber = number < 10 ? `0${number}` : number}

			<div>
				<article class="item">
					<div class:completed>
						<img src={image} alt={name} />

						<form method="post" use:enhanceForm>
							<input type="hidden" name="id" value={id} />
							<button aria-label="Mark as watched" type="submit">🍿</button>
						</form>
					</div>
				</article>

				<p class="title">{episodeNumber} {name}</p>
			</div>
		{/each}
	</section>
</div>

<script lang="ts">
	import { enhanceForm } from '$lib/actions/form'

	export let episodes: any[] = []
</script>

<h1>Episodes</h1>

<!-- <pre>
 {JSON.stringify(episodes, null, 2)}
</pre> -->

<div class="episodes">
	{#each episodes as { id, name, number, image, completed }}
		{@const episodeNumber = number < 10 ? `0${number}` : number}

		<div class="episode">
			<div class="card" class:completed>
				<img src={image} alt={name} />

				<form method="post" use:enhanceForm>
					<input type="hidden" name="id" value={id} />
					<button aria-label="Mark as watched" type="submit">🍿</button>
				</form>
			</div>

			<h3>{episodeNumber} {name}</h3>
		</div>
	{/each}
</div>

<style>
	.episodes {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 2rem;
	}

	.card {
		position: relative;
		transition: opacity 0.3s;
	}

	form {
		position: absolute;
		left: 4px;
		bottom: 4px;
		font-size: 2rem;
	}

	button {
		background: none;
		transition: transform 0.1s;
	}

	button:active {
		transform: scale(0.8);
	}

	.completed {
		opacity: 0.4;
	}
</style>

<script lang="ts">
	import { enhanceForm } from '$lib/actions/form'

	export let episodes: any[] = []
</script>

<h1>Episodes</h1>

<pre>
 {JSON.stringify(episodes, null, 2)}
</pre>

<div class="episodes">
	{#each episodes as { id, name, number, image, completed }}
		<form method="post" use:enhanceForm>
			<input type="hidden" name="id" value={id} />
			<button type="submit" class:completed>{name}</button>
		</form>
	{/each}
</div>

<div class="episodes">
	{#each episodes as { id, name, number, image, completed }}
		{@const episodeNumber = number < 10 ? `0${number}` : number}

		<div class="episode">
			<div class="card" class:completed>
				<h4>{episodeNumber} {name}</h4>
				<img src={image} alt={name} />
			</div>

			<form method="post" use:enhanceForm>
				<input type="hidden" name="id" value={id} />
				<button aria-label="Mark as watched" type="submit">🍿</button>
			</form>
		</div>
	{/each}
</div>

<style>
	.episodes {
		display: flex;
		flex-wrap: wrap;
	}

	.episode {
		position: relative;
	}

	.card {
		transition: opacity 0.3s;
	}

	form {
		position: absolute;
		left: 0;
		bottom: 8px;
		font-size: 2rem;
	}

	button {
		transition: transform 0.1s;
	}

	button:active {
		transform: scale(0.8);
	}

	.completed {
		opacity: 0.4;
	}
</style>

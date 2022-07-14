<script lang="ts">
	import { page } from '$app/stores'
	import { enhanceForm } from '$lib/actions/form'

	export let name = 'Could not find name'
	export let seasons: any[] = []

	const path = $page.url.pathname
</script>

<h1>{name}</h1>

<pre>
 {JSON.stringify(seasons, null, 2)}
</pre>

<div class="seasons">
	{#each seasons as { id, number, image, completed }}
		<div class="season">
			<a href="{path}/seasons/{number}" class:completed>
				<img src={image} alt={name} />
			</a>

			<form method="post" use:enhanceForm>
				<input type="hidden" name="id" value={id} />
				<button aria-label="Mark as watched" type="submit">🍿</button>
			</form>
		</div>
	{/each}
</div>

<style>
	.seasons {
		display: flex;
		flex-wrap: wrap;
	}

	.season {
		position: relative;
	}

	a {
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

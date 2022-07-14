<script lang="ts">
	import { enhanceForm } from '$lib/actions/form'

	export let shows: any[]
</script>

<h1>Shows</h1>

<pre>
 {JSON.stringify(shows, null, 2)}
</pre>

<div class="shows">
	{#each shows as { id, name, slug, image, completed }}
		<div class="show">
			<a href="/shows/{slug}" class:completed>
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
	.shows {
		display: flex;
	}

	.show {
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

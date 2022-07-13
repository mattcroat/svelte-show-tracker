<script lang="ts">
	import { enhanceForm } from '$lib/actions/form'

	export let results = []
</script>

<h1>Track Shows</h1>

<a href="/shows">Shows</a>

<form
	method="post"
	use:enhanceForm={{
		result: ({ form }) => form.reset()
	}}
>
	<input type="hidden" name="show_search" />
	<input type="hidden" name="query" />
	<input type="search" id="search" name="search_query" />
	<button type="submit">Search</button>
</form>

<div class="results">
	{#each results as { id, name, image, added }}
		<form
			class="result"
			class:added
			method="post"
			use:enhanceForm={{
				result: () => {
					alert('Show added!')
				},
				error: async ({ response }) => {
					const { message } = await response?.json()
					alert(message)
				}
			}}
		>
			<fieldset disabled={added}>
				<h3>{name}</h3>
				<input type="hidden" name="show_add" />
				<input type="hidden" name="id" value={id} />
				<button type="submit">
					<img src={image} alt={name} />
				</button>
			</fieldset>
		</form>
	{/each}
</div>

<style>
	.results {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.added {
		opacity: 0.4;
	}
</style>

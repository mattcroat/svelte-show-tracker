<script lang="ts">
	import { enhanceForm } from '$lib/actions/form'

	export let results = []

	let status: 'loading' | 'loaded' | 'error'
	let error: string
</script>

<h2>Search</h2>

<form
	method="post"
	class="search"
	autocomplete="off"
	use:enhanceForm={{
		pending: () => {
			status = 'loading'
		},
		error: async ({ response }) => {
			status = 'error'
			error = (await response?.json()).message
		},
		result: ({ form }) => {
			status = 'loaded'
			error = ''
			form.reset()
		}
	}}
>
	<input type="hidden" name="search" />
	<input type="text" name="show" placeholder="Search for a show..." />
	<button type="submit">Submit</button>
</form>

{#if status === 'loading'}
	<img
		class="loading"
		src="https://i.giphy.com/media/3o7abHrsGbV10rCeze/giphy.webp"
		alt="Loading..."
	/>
{/if}

{#if status === 'error'}
	<img
		class="error"
		src="https://i.giphy.com/media/146BUR1IHbM6zu/giphy.webp"
		alt="Error"
	/>
{/if}

{#if status === 'loaded'}
	<div class="results">
		{#each results as { id, name, image, added }}
			<form
				method="post"
				class="result"
				class:added
				use:enhanceForm={{
					error: async ({ response }) => {
						const { message } = await response?.json()
						alert(message)
					},
					result: () => {
						alert('Show added!')
					}
				}}
			>
				<fieldset disabled={added}>
					<input type="hidden" name="add" />
					<input type="hidden" name="id" value={id} />
					<button type="submit">
						<img src={image} alt={name} />
					</button>
				</fieldset>
				<p class="title">{name}</p>
			</form>
		{/each}
	</div>
{/if}

<style>
	h2 {
		color: var(--teal-3);
		font-size: var(--font-size-6);
		padding-top: var(--size-7);
		padding-bottom: var(--size-3);
		text-align: center;
	}

	.search {
		position: relative;
		width: max-content;
		margin: 0 auto;
		box-shadow: var(--shadow-1);
	}

	.search input {
		padding: var(--size-4) var(--size-8);
		color: var(--gray-4);
		font-size: var(--font-size-4);
		background: var(--gray-8);
		border-radius: var(--radius-3);
		border: none;
	}

	.search input::placeholder {
		color: var(--gray-6);
	}

	.search button {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		padding: 0 var(--size-6);
		color: var(--gray-0);
		background: none;
	}

	.loading,
	.error {
		height: 200px;
		width: 200px;
		margin: var(--size-10) auto;
		border-radius: var(--radius-blob-4);
		object-fit: cover;
	}

	.results {
		display: grid;
		grid-template-columns: var(--grid);
		place-content: center;
		gap: var(--size-7);
		padding: var(--size-7) 0;
	}

	.result img {
		box-shadow: var(--shadow-3);
	}

	.result .title {
		padding-top: var(--size-2);
	}

	.added {
		opacity: 0.2;
	}

	.added button {
		cursor: not-allowed;
	}
</style>

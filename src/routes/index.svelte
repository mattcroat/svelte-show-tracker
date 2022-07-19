<script lang="ts">
	import { enhanceForm } from '$lib/actions/form'
	import type { SearchResult } from '$lib/types'

	export let results: SearchResult[] = []

	let status: 'loading' | 'loaded' | 'error'
</script>

<h2>Add Show</h2>

<form
	method="post"
	class="search"
	autocomplete="off"
	use:enhanceForm={{
		pending: () => {
			status = 'loading'
		},
		error: async () => {
			status = 'error'
			alert('Something went wrong. 💩')
		},
		result: ({ form }) => {
			status = 'loaded'
			form.reset()
		}
	}}
>
	<input type="hidden" name="search" />
	<input type="search" name="show" placeholder="Search" />
	<button aria-label="Search for a show" type="submit">
		<svg
			width="24"
			height="24"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			/>
		</svg>
	</button>
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
					error: async () => {
						status = 'error'
						alert('Could not add show. 💩')
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
		display: flex;
		width: max-content;
		margin: 0 auto;
		box-shadow: var(--shadow-1);
	}

	.search:focus-within {
		outline: 3px solid var(--teal-3);
		border-radius: var(--radius-3);
	}

	.search input {
		padding: var(--size-4) var(--size-3);
		color: var(--gray-4);
		font-size: var(--font-size-2);
		background: var(--gray-8);
		border-radius: var(--radius-3) 0 0 var(--radius-3);
		border: none;
		outline: none;
	}

	.search input::placeholder {
		color: var(--gray-6);
	}

	.search button {
		padding: 0 var(--size-2);
		color: var(--gray-0);
		background: var(--gray-8);
		border-radius: 0 var(--radius-3) var(--radius-3) 0;
	}

	.search button svg {
		color: var(--gray-4);
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
		grid-template-columns: var(--grid-shows);
		place-content: center;
		gap: var(--size-7);
		padding: var(--size-7) 0;
	}

	.result img {
		width: 210px;
		height: 295px;
		object-fit: cover;
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

	@media (min-width: 480px) {
		.search input {
			padding: var(--size-4) var(--size-8);
			font-size: var(--font-size-4);
		}

		.search button {
			padding: 0 var(--size-3);
		}
	}
</style>

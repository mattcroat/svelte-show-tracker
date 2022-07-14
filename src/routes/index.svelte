<script lang="ts">
	import { enhanceForm } from '$lib/actions/form'

	export let results = []

	let status: 'loading' | 'loaded' | 'error'
	let error: string
</script>

<h1>Track Shows</h1>

<form
	method="post"
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
	<input type="search" name="show" />
	<button type="submit">Search</button>
</form>

{#if status === 'loading'}
	<h3>Loading...</h3>
{/if}

{#if status === 'error'}
	<h1>{error}</h1>
{/if}

{#if status === 'loaded'}
	<div class="results">
		{#each results as { id, name, image, added }}
			<form
				class="result"
				class:added
				method="post"
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
					<h3>{name}</h3>
					<input type="hidden" name="add" />
					<input type="hidden" name="id" value={id} />
					<button type="submit">
						<img src={image} alt={name} />
					</button>
				</fieldset>
			</form>
		{/each}
	</div>
{/if}

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

<script lang="ts">
	import 'open-props/style'
	import '../app.css'
</script>

<div class="container">
	<header>
		<h1>🍿 Tracker</h1>
		<nav>
			<a href="/">Search</a>
			<a href="/shows">Progress</a>
		</nav>
	</header>

	<main>
		<slot />
	</main>
</div>

<style>
	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 var(--size-7);
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--size-7) 0;
	}

	h1 {
		font-size: var(--font-size-3);
	}

	nav {
		display: flex;
		justify-content: end;
		gap: var(--size-3);
	}
</style>

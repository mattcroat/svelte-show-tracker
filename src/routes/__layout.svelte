<script lang="ts">
	import 'open-props/style'
	import '../app.css'
</script>

<header>
	<h1>Track Shows</h1>
	<nav>
		<a href="/">Home</a>
		<a href="/shows">Progress</a>
	</nav>
</header>

<main>
	<slot />
</main>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	h1 {
		font-size: var(--font-size-3);
	}

	nav {
		display: flex;
		justify-content: end;
		gap: var(--size-3);
	}

	main {
		display: grid;
		justify-content: center;
		justify-items: center;
	}
</style>

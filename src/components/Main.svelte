<script>
    import Card from "./Card.svelte"
    import eventCards from "../../public/data.json"
    import { flip } from 'svelte/animate';
    import {quintInOut} from 'svelte/easing';
	import {fly} from 'svelte/transition'
	let pushed = '';
	$: pushed = pushed 
</script>

<main>
    <h1 class='text-slate-900'>Israel Palestine Timeline</h1>
    <ul role="list" class="flex flex-col gap-16">
        {#each eventCards as eventCard(eventCard.id)}
			{#key pushed}
				<div transition:fly>
					<Card eventObj={eventCard} summery={pushed}/>
				</div>
			{/key}
        {/each}
    </ul>
</main>


<style>
	main {
		margin: auto;
		padding: 1rem;
		width: 800px;
		max-width: calc(100% - 2rem);
		font-size: 20px;
		line-height: 1.6;
	}
	.astro-a {
		position: absolute;
		top: -32px;
		left: 50%;
		transform: translatex(-50%);
		width: 220px;
		height: auto;
		z-index: -1;
	}
	h1 {
		font-size: 4rem;
		font-weight: 700;
		line-height: 1;
		text-align: center;
		margin-bottom: 1em;
	}
	.text-gradient {
		background-image: var(--accent-gradient);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-size: 400%;
		background-position: 0%;
	}
	.instructions {
		margin-bottom: 2rem;
		border: 1px solid rgba(var(--accent-light), 25%);
		background: linear-gradient(rgba(var(--accent-dark), 66%), rgba(var(--accent-dark), 33%));
		padding: 1.5rem;
		border-radius: 8px;
	}
	.instructions code {
		font-size: 0.8em;
		font-weight: bold;
		background: rgba(var(--accent-light), 12%);
		color: rgb(var(--accent-light));
		border-radius: 4px;
		padding: 0.3em 0.4em;
	}
	.instructions strong {
		color: rgb(var(--accent-light));
	}
	.link-card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(24ch, 1fr));
		gap: 2rem;
		padding: 0;
	}
</style>

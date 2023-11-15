<script>
    import Card from "./Card.svelte"
    import eventCards from "../../public/data.json"
	import Timeline from "./Timeline.svelte";
    import { flip } from 'svelte/animate';
    import {quintInOut} from 'svelte/easing';
	import {fly} from 'svelte/transition'
</script>

<main class='w-full'>
	<div class='flex flex-col h-screen'>
		<div class='flex flex-row justify-start'>
			<Timeline/>
			<h1 class='w-11/12 mt-8 pb-96 text-slate-900'>Israel Palestine Timeline</h1>
		</div>
		<div role="list" class="flex flex-col w-full">
			{#each eventCards as eventCard(eventCard.id)}
				<div>
					<Card eventObj={eventCard}/>
				</div>
			{/each}
		</div>
		<div class='h-full flex'>
			<Timeline/>
			<div class='w-11/12'></div>
		</div>
	</div>
</main>


<style>
	.rectangle {
		width: 10px;
		height: 100%;
	}
	main {
		font-size: 20px;
		line-height: 1.6;
	}
	h1 {
		font-size: 4rem;
		font-weight: 700;
		line-height: 1;
		text-align: center;
		margin-bottom: 1em;
	}
	.gibby {
		background-color: white;
		border: 4px solid black;
		transform: translateY(50px);
		border-radius: 50%;
		z-index: 1;
	}
</style>

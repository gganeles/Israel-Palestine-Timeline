<script>
    import Card from "./Card.svelte"
    import eventCards from "../../public/event.json"
	import Timeline from "./Timeline.svelte";
	import {slide} from "svelte/transition"
	import dayjs from "dayjs"
	const dateFormat = 'MMMM DD, YYYY'
	const regex = /\d{2}(?=T\d{2}:\d{2}:\d{2}\.\d{3}Z)/
	let languageSelect = false;
	let language='English';
	const pickLanguage = (e) => {
		language=e.target.innerText
	}
</script>
<!-- svelte-ignore a11y-no-static-element-interactions -->

<main class='w-full'>
	<header class="fixed flex flex-row bg-white h-16 w-full border-b-black drop-shadow-md z-50">
		<div class='w-1/12 left-0 z-10 flex justify-center'>
			<div class='rectangle bg-black z-10'/>
		</div>
		<div on:mouseleave={()=>languageSelect=false} class='absolute right-0 flex flex-col bg-white'>
			<div on:mouseenter={()=>languageSelect=true} class='px-4 h-16 flex text-center items-center hover:bg-slate-300'>
				Language
			</div>
			{#if languageSelect}
				{#each ['English','Arabic','Hebrew'] as lang}
					<div on:click={pickLanguage} on:keypress={(e)=>e.code==='ENTER'&&pickLanguage(e)} transition:slide|global class='pl-4 h-16 flex text-center items-center hover:bg-slate-300'>
						{lang}
					</div>
				{/each}
			{/if}
		</div>
	</header>
	<div class='pt-16 flex flex-col h-full'>
		<Timeline>
			<h1 class='mt-8 pb-24 text-slate-900'>Israel Palestine Timeline in {language}</h1>
		</Timeline>
		<div role="list" class="flex flex-col w-full">
			{#each eventCards['events'] as eventCard}
				{#if (eventCard.eventId===0)}
					<Timeline>
						<div class='p-4 text-slate-800'>
							{dayjs(eventCard.date).format(dateFormat)}
						</div>
					</Timeline>
				{:else if (eventCards['events'][eventCard.eventId-1] && eventCards['events'][eventCard.eventId] && regex.exec(eventCards['events'][eventCard.eventId-1].date)[0] != regex.exec(eventCards['events'][eventCard.eventId].date)[0])}
					<Timeline>
						<div class='pl-4 pb-4 text-slate-800'>
							{dayjs(eventCard.date).format(dateFormat)}
						</div>
					</Timeline>
				{/if}
				<div>
					<Card eventObj={eventCard}/>
				</div>
			{/each}
		</div>
		<Timeline/>
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

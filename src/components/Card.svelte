<script>
	export let eventObj = '';
	export let href = '';
	let summery = '';
	let hoverable = true;

	import { fly, slide } from 'svelte/transition';

</script>

<li>
		<div class="bg-white rounded-t-lg text-slate-900 p-4 pb-8 drop-shadow-md">
			<p>
				{eventObj.date}
			</p>
			<h2 class='font-bold text-3xl underline'>
				{eventObj.headline}
			</h2>
		</div>
		<ul on:mouseleave={()=>{
			if (hoverable) {summery=''}
			}} class:rounde={summery!=''} class="front drop-shadow-md rounded-b-lg bg-slate-100 text-xl text-slate-900 font-bold flex flex-row justify-start divide-x divide-slate-500" on:mouseleave={()=>summery=''}>
			{#each eventObj.sources as source}
				<a href="#" on:click={()=>{summery=source.summery; hoverable=!hoverable}} 
					on:mouseenter={()=>{
						hoverable ?summery=source.summery:''
						}} class='sfront flex w-20 h-16 hover:bg-slate-300 items-center justify-center'>
					{source.sourceName}
				</a>
			{/each}
		</ul>
		{#if summery} 
			<div transition:slide={{y:-10, duration:500}} class="drop-shadow bg-white rounded-b-lg p-4 text-slate-900 shadowd">
				{summery}
			</div>
		{/if}
</li>

<style>

	.rounde {
		border-radius: 0%;
	}
	.front {
		z-index: 10;
	}
</style>
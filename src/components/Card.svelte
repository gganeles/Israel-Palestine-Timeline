<script>
	export let eventObj = '';
	export let href = '';
	let summery = '';
	import { slide } from 'svelte/transition';

</script>

<div class='flex flex-row w-full'>
	<div class='w-1/6 flex justify-center'>
		<div class='absolute w-6 h-6 border-solid border-blue mt-10 bg-black rounded-full'></div>
		<div class="bg-black rectangle"></div>
	</div>
	<div class='w-5/6 pb-10 pr-10 drop-shadow-lg'>
		<div class='flex flex-row justify-start'>
			<div class='w-5 translate-y-7'>
				<div class='triangle-br'></div>
				<div class='triangle-tr'></div>
			</div> 
		<div class='w-full flex flex-col'>
		<div class="bg-white rounded-t-lg text-slate-900 p-4 pb-8">
			<p>
				{eventObj.date}
			</p>
			<h2 class='font-bold text-3xl underline'>
				{eventObj.headline}
			</h2>
		</div>
		<ul class:rounde={summery!=''} class="overflow-hidden hover:overflow-x-scroll front rounded-b-lg bg-slate-100 text-xl text-slate-900 font-bold flex flex-row justify-start divide-x divide-slate-500" on:mouseleave={()=>summery=''}>
			{#each eventObj.sources as source}
				<a href="#" on:focusin={()=>{summery=source.summery}} on:focusout={()=>{summery=''}}
					on:mouseenter={()=>{summery=source.summery}} class='p-2 flex max-w-30 h-16 hover:bg-slate-300 items-center justify-center'>
					{source.sourceName}
				</a>
			{/each}
		</ul>
		{#if summery} 
			<div transition:slide={{duration:300}} class="bg-white rounded-b-lg p-4 text-slate-900">
				{summery}
			</div>
		{/if}
	</div>
	</div>
	</div>
</div>

<style>
	.rectangle {
		width:10px;
		height: 100%;
	}

	.rounde {
		border-radius: 0%;
	}
	.front {
		z-index: 10;
	}

	::-webkit-scrollbar {
		height: 5px;
		background-color: white;
	}

	::-webkit-scrollbar-thumb {
		background-color:rgb(180, 180, 180);
		border-radius: 2.5px;
	}

	.triangle-br {
	  width: 1px;
      height: 1px;
      border-bottom: 24px solid rgb(255, 255, 255);
      border-left: 24px solid transparent;
	}

	.triangle-tr {
	  width: 1px;
      height: 1px;
      border-top: 24px solid rgb(255, 255, 255);
      border-left: 24px solid transparent;
	}
</style>
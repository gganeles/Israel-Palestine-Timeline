<script>
	export let eventObj = '';
	export let href = '';
	let summery = '';
	let hovered = false;

</script>

<li class='bg-white rounded-lg drop-shadow-lg'>
		<div class="bg-white rounded-t-lg text-slate-900 p-4 pb-8 drop-shadow">
			<p>
				{eventObj.date}
			</p>
			<h2 class='font-bold text-3xl underline'>
				{eventObj.headline}
			</h2>
		</div>
		<ul on:mouseleave={()=>{
			summery=''
			}} class:rounde={summery!=''} class="drop-shadow rounded-b-lg bg-slate-100 text-xl text-slate-900 font-bold flex flex-row justify-start divide-x divide-slate-500" on:mouseleave={()=>summery=''}>
			{#each eventObj.sources as source}
				<a on:mouseenter={()=>{
					summery=source.summery;
					}} href={href} class='flex w-20 h-16 hover:bg-slate-300 items-center justify-center'>
					{source.sourceName}
				</a>
			{/each}
		</ul>
		{#if summery} 
			<div class="p-4 text-slate-900">
				{summery}
			</div>
		{/if}
</li>

<style>

	.rounde {
		border-radius: 0%;
	}
</style>
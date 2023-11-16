<script>
	export let eventObj = "";
	export let href = "";
	let summery = "";
	let title = "";
	let rounde = false;
	import { slide } from "svelte/transition";
	import dayjs from "dayjs"
	const dateFormat = 'hh:mm a'
</script>

<div class="flex flex-row w-full">
	<div class="w-1/12 flex justify-center">
		<div
			class="absolute w-6 h-6 border-solid border-blue mt-10 bg-black rounded-full"
		/>
		<div class="bg-black rectangle" />
	</div>
	<!-- svelte-ignore a11y-unknown-role -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		role="aria-card"
		class="w-11/12 pb-10 pr-10 drop-shadow-lg"
		on:mouseleave={() => (summery = "")}
	>
		<div class="flex flex-row justify-start">
			<div class="w-4 translate-y-7">
				<div class="triangle-br" />
				<div class="triangle-tr" />
			</div>
			<div
				class="w-full flex flex-col rounded-xl bg-white overflow-hidden"
			>
				<div class="bg-white text-slate-900 p-4">
					<p>
						{dayjs(eventObj.date).format(dateFormat)}
					</p>
					<h2 class="font-bold text-3xl underline">
						{eventObj.title}
					</h2>
					<p class="pt-2 text-base">
						{eventObj.description}
					</p>
				</div>
				<ul
					class:rounde
					class="overflow-hidden hover:overflow-x-auto bg-slate-100 flex flex-row justify-start divide-x divide-slate-400"
				>
					{#each eventObj.articles as source}
						<a
							href={source.url}
							on:focusin={() => {
								summery = source.analysis;
								title = source.title;
							}}
							on:focusout={() => {
								summery = "";
								title = "";
							}}
							on:mouseenter={() => {
								summery = source.analysis;
								title = source.title;
							}}
							class="flex hover:bg-slate-300 items-center justify-center"
						>
							<div
								class="text-sm font-bold text-slate-900 h-16 w-16 flex items-center text-center"
							>
								{source.sourceName}
							</div>
						</a>		
					{/each}
				</ul>
				{#if summery}
					<div
						transition:slide={{ duration: 300 }}
						class="p-4"
					>
						<h3 class="text-base text-slate-900 underline font-bold">{title}</h3>
						<p class="text-sm">{summery}</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.rectangle {
		width: 10px;
		height: 100%;
	}

	::-webkit-scrollbar {
		height: 5px;
		background-color: white;
	}

	::-webkit-scrollbar-thumb {
		background-color: rgb(180, 180, 180);
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

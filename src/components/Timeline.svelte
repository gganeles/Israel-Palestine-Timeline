<div class='flex flex-row justify-start'>
	<div class='flex justify-center w-1/12'>
		<div class='bg-black rectangle'></div>
	</div>
	<div class='w-11/12'>
		<slot/>
	</div>
</div>

<style>
	.rectangle {
		width: 10px;
		height: 100%;
	}
</style>
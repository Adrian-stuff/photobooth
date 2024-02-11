<script>
	import { onMount } from 'svelte';
	import './style.css';
	/** @type {import('./$types').PageData} */
	export let data;

	/**
	 * @type {HTMLImageElement}
	 */
	let image;

	onMount(() => {
		console.log(data.frameData);
	});
</script>

<div class="container">
	<div class="print-container">
		<img
			bind:this={image}
			class={`image another-image ${data.frameData.frameType === 'spotify' ? 'spotify' : 'print-image'}`}
			src={`/uploads/${data.code}/image.png`}
			alt=""
		/>
		{#if data.frameData.frameType !== 'spotify'}
			<!-- content here -->
			<img
				bind:this={image}
				class="image print-image"
				src={`/uploads/${data.code}/image.png`}
				alt=""
			/>
		{/if}
	</div>
	<div class="bottom-container no-print">
		<h1 class="no-print">{data.code}</h1>
		<div class="buttons">
			<button class="no-print" on:click={() => window.print()}>Print</button>
		</div>
	</div>
	{#if data.frameData.frameType !== 'spotify'}
		<div class="video-preview no-print">
			<!-- svelte-ignore a11y-media-has-caption -->
			<video src={`/uploads/${data.code}/final.mp4`} autoplay loop></video>
		</div>
	{/if}
</div>

<!-- <h1>{data.content}</h1> -->

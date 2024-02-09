<script lang="ts">
	import { goto } from '$app/navigation';
	import { transformJson, type codeObject } from '$lib';
	import { io } from 'socket.io-client';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	const socket = io();
	let code = writable('');
	let data: codeObject[];
	code.subscribe(async (code) => {
		if (code.length !== 0) {
			console.log(code);
			const res = await fetch(`/api/getImage/${code}`);
			const resData = await res.json();
			console.log(resData);
			data = [resData, ...data];
		}
	});

	socket.on('new-image', (code: string) => {
		console.log(code);
		$code = code;
	});

	async function getImages() {
		const res = await fetch('/api/getImage');
		data = transformJson(await res.json()).reverse();
	}

	onMount(async () => {
		await getImages();
		console.log(data);
	});
</script>

<div>
	<div class="imageHolder">
		{#if data}
			{#each data as item}
				<div class="frame-holder">
					<img class="imagePreview" src={`/uploads/${item.code}/image.png`} alt="" />
					<div class="bottom-container">
						<div class="text-holder">
							<h1>{item.code}</h1>
							<h1>{item.frameType}</h1>
						</div>
						<button
							on:click={() => {
								goto(`/print/${item.code}`);
							}}>PRINT</button
						>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	:root {
		font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
		line-height: 1.5;
		color-scheme: light dark;
		color: rgba(255, 255, 255, 0.87);
		background-color: #242424;
		font-synthesis: none;
		text-rendering: optimizeLegibility;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	h1 {
		font-size: 3.2em;
		line-height: 1.1;
	}

	button {
		border-radius: 8px;
		border: 1px solid transparent;
		padding: 0.6em 1.2em;
		font-size: 1em;
		font-weight: 500;
		font-family: inherit;
		background-color: #1a1a1a;
		cursor: pointer;
		transition: border-color 0.25s;
	}
	button:hover {
		border-color: #646cff;
	}
	button:focus,
	button:focus-visible {
		outline: 4px auto -webkit-focus-ring-color;
	}

	.imagePreview {
		width: 150px;
	}
	.imageHolder {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 5px;
	}

	.frame-holder {
		display: flex;
		flex-direction: column;
	}

	.text-holder {
		text-transform: uppercase;
		font-size: 5px;
	}
	.bottom-container {
		display: flex;
		padding: 5px;
	}
</style>

<script>
	import { onMount } from 'svelte';
	// import PDFDocument from 'pdfkit';
	import './style.css';
	import { browser } from '$app/environment';
	import { FFmpeg } from '@ffmpeg/ffmpeg';
	import { fetchFile, toBlobURL } from '@ffmpeg/util';
	import { framesInfo } from '$lib';

	/** @type {import('./$types').PageData} */
	export let data;

	/**
	 * @type {HTMLImageElement}
	 */
	let image;

	/**
	 * @type {HTMLIFrameElement}
	 */
	let iframe;

	/**
	 * @type {FFmpeg}
	 */
	let ffmpeg;

	/**
	 * @type {string}
	 */
	let imageString;

	let frameWidth = framesInfo[data.frameData.frameType].width;
	let frameHeight = framesInfo[data.frameData.frameType].height;

	if (browser) {
		ffmpeg = new FFmpeg();
	}
	const downloadFile = (/** @type {string} */ fileName, /** @type {string} */ url) => {
		const link = document.createElement('a');
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};
	const generateImage = async () => {
		await ffmpeg.writeFile(
			'image.png',
			await fetchFile(`${window.location.origin}/uploads/${data.code}/image.png`)
		);
		await ffmpeg.writeFile('black.jpg', await fetchFile(`${window.location.origin}/black.jpg`));
		await ffmpeg.exec([
			'-i',
			'black.jpg',
			'-i',
			'image.png',
			'-i',
			'image.png',
			'-filter_complex',
			`[0]scale=${frameWidth * 2 + 10}:${frameHeight}[v0];[v0][1:v]overlay=0:0[v1];[v1][2:v]overlay=${frameWidth + 10}:0[v2]`,
			'-map',
			'[v2]',
			'out.png'
		]);
		const file = await ffmpeg.readFile(`out.png`);

		// @ts-ignore
		const url = URL.createObjectURL(new Blob([file.buffer], { type: 'image/png' }));
		console.log(url);
		return url;
	};
	async function load() {
		const baseURL = `${window.location.origin}/esm`;

		ffmpeg.on('log', ({ message }) => {
			console.log(message);
		});

		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
			wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
			workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
		});
	}
	onMount(() => {
		// generatePDF();
		load();
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
			<button
				class="no-print"
				on:click={() => {
					// generateImage();
					window.print();
				}}>Print</button
			>
			<button
				class="no-print"
				on:click={() => {
					downloadFile(
						`${data.code}.png`,
						`${window.location.host}/uploads/${data.code}/image.png`
					);
				}}>Download Image</button
			>
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

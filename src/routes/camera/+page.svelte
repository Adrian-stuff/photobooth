<script lang="ts">
	export const srr = false;
	import { writable } from 'svelte/store';
	import Camera from './Camera.svelte';
	import CountdownTimer from './CountdownTimer.svelte';
	import { onMount } from 'svelte';
	import { FFmpeg } from '@ffmpeg/ffmpeg';
	import { fetchFile, toBlobURL } from '@ffmpeg/util';
	import { browser } from '$app/environment';
	let camera: Camera;
	let timer: CountdownTimer;
	let previewImage: string;
	let previewVideo: string;

	let ffmpeg: FFmpeg;

	if (browser) {
		ffmpeg = new FFmpeg();
	}
	const count = writable(0);
	const imagesBlobArray = writable<string[]>([]);
	const videosBlobArray = writable<string[]>([]);

	videosBlobArray.subscribe((val) => {
		console.log(val);
		if ($videosBlobArray.length === 3) {
			generateImage();
		}
	});
	async function load() {
		const baseURL = `${window.location.origin}/esm`;

		ffmpeg.on('log', ({ message }: any) => {
			console.log(message);
		});

		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
			wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
			workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
		});
	}
	function resetArrays() {
		$imagesBlobArray = [];
		$videosBlobArray = [];
		previewImage = '';
		previewVideo = '';
	}

	async function generateImage() {
		await ffmpeg.writeFile('frame.png', await fetchFile(`${window.location.origin}/5.png`));
		await ffmpeg.writeFile(`0.jpg`, await fetchFile($imagesBlobArray[0]));
		await ffmpeg.writeFile(`1.jpg`, await fetchFile($imagesBlobArray[1]));
		await ffmpeg.writeFile(`2.jpg`, await fetchFile($imagesBlobArray[2]));

		await ffmpeg.exec([
			'-i',
			'0.jpg', // Input JPEG image 0
			'-i',
			'1.jpg', // Input JPEG image 1
			'-i',
			'2.jpg', // Input JPEG image 2
			'-i',
			'frame.png', // Input background image
			'-filter_complex',
			'[0:v]scale=664:-1[v0];[1:v]scale=664:-1[v1];[2:v]scale=664:-1[v2];[3:v][v0]overlay=x=68:y=80[v4];[v4][v1]overlay=x=68:y=606[v5];[v5][v2]overlay=x=68:y=1133[v6];[v6][3:v]overlay=x=0:y=0[v7]',
			'-map',
			'[v7]', // Map the final overlay stream
			'-y',
			// "-update",
			// "true",
			// "-vframes",
			// "1",
			'out.png' // Output PNG file
		]);

		const data: any = await ffmpeg.readFile(`out.png`);

		// Create a URL
		const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/png' }));
		console.log('hello', url);

		previewImage = url;
		resetArrays();
	}

	function onTimerEnd() {
		camera.stopRecording();
		camera.captureImage();
		$count = $count + 1;

		if ($count < 3) {
			startCapturing();
			console.log('sup');
		}
		if ($count === 3) {
			timer.stopCountdown();
		}
	}

	function startCapturing() {
		timer.startCountdown();
		camera.startRecording();
	}

	onMount(async () => {
		load();
		const handleKeyPress = (event: any) => {
			event.preventDefault;
			if (event.key === ' ' || event.code === 'Space') {
				startCapturing();
			}
		};

		window.addEventListener('keydown', handleKeyPress);
	});
</script>

<Camera
	onCapture={(imageUrl) => {
		previewImage = imageUrl;
		$imagesBlobArray = [...$imagesBlobArray, imageUrl];
	}}
	onMediaUrl={(videoUrl) => {
		previewVideo = videoUrl;
		$videosBlobArray = [...$videosBlobArray, videoUrl];
	}}
	bind:this={camera}
></Camera>

<button on:click={() => startCapturing()}>captureImage</button>
<img src={previewImage} alt="" />
<button on:click={() => camera.startRecording()}>record</button>
<button on:click={() => camera.stopRecording()}>stop</button>
<!-- svelte-ignore a11y-media-has-caption -->
<video src={previewVideo} controls autoplay />
{#each $imagesBlobArray as imageSrc}
	<div>
		<img src={imageSrc} alt="" />
	</div>
{/each}
<div>
	<CountdownTimer initialSeconds={3} onTimeEnd={onTimerEnd} bind:this={timer}></CountdownTimer>
</div>

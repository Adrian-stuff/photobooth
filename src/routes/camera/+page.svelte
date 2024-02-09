<script lang="ts">
	export const srr = false;
	import { writable } from 'svelte/store';
	import Camera from './Camera.svelte';
	import CountdownTimer from './CountdownTimer.svelte';
	import { onMount } from 'svelte';
	import { FFmpeg } from '@ffmpeg/ffmpeg';
	import { fetchFile, toBlobURL } from '@ffmpeg/util';
	import { browser } from '$app/environment';
	import './style.css';
	import { io } from 'socket.io-client';
	const socket = io();

	import { blobToBase64, framesInfo } from '$lib';
	let camera: Camera;
	let timer: CountdownTimer;
	let previewImage: string;
	let previewVideo: string;
	let finalImage = writable('');
	let isRunning = false;
	let ffmpeg: FFmpeg;
	let frameType = 'frame-2';
	// $: imageGenerated = $finalImage;
	if (browser) {
		ffmpeg = new FFmpeg();
	}
	const count = writable(0);
	const imagesFilesArray = writable<File[]>([]);
	const videosBlobArray = writable<File[]>([]);
	const imagesBlobArray = writable<string[]>([]);
	const code = writable('');

	videosBlobArray.subscribe((val) => {
		console.log('blob Array', val);
		if ($videosBlobArray.length === 3) {
			generateImage();
		}
	});
	imagesFilesArray.subscribe((val) => {
		console.log('file image Array', val);
	});
	imagesBlobArray.subscribe((val) => {
		console.log('image blob', val);
	});

	code.subscribe((val) => {
		if (val.length !== 0) {
			socket.emit('newImage', val);
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
		const frameData = framesInfo[frameType];
		await ffmpeg.writeFile(
			'frame.png',
			await fetchFile(`${window.location.origin}/${frameData.frameUrl}`)
		);
		await ffmpeg.writeFile(`0.png`, await fetchFile($imagesBlobArray[0]));
		await ffmpeg.writeFile(`1.png`, await fetchFile($imagesBlobArray[1]));
		await ffmpeg.writeFile(`2.png`, await fetchFile($imagesBlobArray[2]));

		await ffmpeg.exec([
			'-i',
			'0.png', // Input JPEG image 0
			'-i',
			'1.png', // Input JPEG image 1
			'-i',
			'2.png', // Input JPEG image 2
			'-i',
			'frame.png', // Input background image
			'-filter_complex',
			`[0:v]scale=664:-1[v0];[1:v]scale=664:-1[v1];[2:v]scale=664:-1[v2];[3:v][v0]overlay=x=${frameData.coordinates[0].x}:y=${frameData.coordinates[0].y}[v4];[v4][v1]overlay=x=${frameData.coordinates[1].x}:y=${frameData.coordinates[1].y}[v5];[v5][v2]overlay=x=${frameData.coordinates[2].x}:y=${frameData.coordinates[2].y}[v6];[v6][3:v]overlay=x=0:y=0[v7]`,
			'-map',
			'[v7]', // Map the final overlay stream
			'-y',
			'out.png' // Output PNG file
		]);

		const data: any = await ffmpeg.readFile(`out.png`);

		const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/png' }));
		console.log('hello', url);

		$finalImage = url;
		isRunning = false;
		const copyVideosBlobArray = [...$videosBlobArray];
		const copyImagesBlobArray = [...$imagesFilesArray];
		resetArrays();
		await uploadFiles(
			new File([new Blob([data.buffer], { type: 'image/png' })], 'image'),
			copyVideosBlobArray,
			copyImagesBlobArray
		);
	}
	async function uploadFiles(url: File, videosBlobArray: File[], imagesBlobArray: File[]) {
		const formData = new FormData();
		formData.append('frameType', frameType);
		formData.append('image', url);
		videosBlobArray.map((val, index) => {
			formData.append(`video-${index}`, val);
		});
		imagesBlobArray.map((val, index) => {
			formData.append(`image-${index}`, val);
		});
		await fetch('/api/upload', { method: 'POST', body: formData })
			.then((val) => val.json())
			.then((val: { success: boolean; code: string }) => {
				console.log('fetch Data', val);
				$code = val.code;
			});
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
			$count = 0;
		}
	}

	function startCapturing() {
		camera.startRecording();

		if (!isRunning) {
			timer.restartCountdown();
		} else {
			timer.resetCounter();
		}

		isRunning = true;
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

<div class="layout">
	<div class="preview-camera">
		<div class="webcam">
			<Camera
				onCapture={(imageUrl, fileImage) => {
					previewImage = imageUrl;
					$imagesFilesArray = [...$imagesFilesArray, fileImage];
					$imagesBlobArray = [...$imagesBlobArray, imageUrl];
				}}
				onMediaUrl={(videoUrl, fileVideo) => {
					previewVideo = videoUrl;
					$videosBlobArray = [...$videosBlobArray, fileVideo];
				}}
				bind:this={camera}
			></Camera>
		</div>
		<CountdownTimer initialSeconds={5} onTimeEnd={onTimerEnd} bind:this={timer}></CountdownTimer>
	</div>
	<div class="side-preview">
		<div class="images">
			{#if isRunning}
				{#each $imagesBlobArray as imageSrc}
					<img src={imageSrc} alt="" />
				{/each}
			{:else}
				<img src={$finalImage} alt="" />
			{/if}
		</div>
	</div>
	<!-- <button on:click={() => startCapturing()}>captureImage</button> -->
	<!-- <img src={previewImage} alt="" /> -->

	<!-- svelte-ignore a11y-media-has-caption -->
	<!-- <video src={previewVideo} autoplay loop /> -->
	<!-- {#each $videosBlobArray as imageSrc}
		<div>
			<video src={imageSrc} />
		</div>
	{/each} -->
</div>

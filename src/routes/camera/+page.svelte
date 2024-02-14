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

	import { framesInfo } from '$lib';
	let camera: Camera;
	let timer: CountdownTimer;
	let previewImage: string;
	let previewVideo: string;
	let finalImage = writable('');
	let isRunning = false;
	let ffmpeg: FFmpeg;
	let frameType = 'korean-2';
	let frame1Type = '1';
	let frame2Type = '2';
	let frames: number;
	$: frames = framesInfo[frameType].frames;
	let frameSelection = Object.keys(framesInfo);
	let frameSpotifySelection = Object.keys(
		framesInfo['spotify'].frameTypes !== undefined ? framesInfo['spotify'].frameTypes : ''
	);
	let frameLandscapeSelection = Object.keys(
		framesInfo['single-hvd-blue'].frameTypes !== undefined
			? framesInfo['single-hvd-blue'].frameTypes
			: ''
	);
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
	});
	imagesFilesArray.subscribe((val) => {
		console.log('file image Array', val);
		if (val.length === frames) {
			generateImage();
		}
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
		$imagesFilesArray = [];

		$imagesBlobArray = [];
		$videosBlobArray = [];
		previewImage = '';
		previewVideo = '';
	}

	async function generateImage() {
		const frameData = framesInfo[frameType];

		if (frameData.useDiff) {
			let frameSpotifyData = frameData.frameTypes;

			if (frameSpotifyData !== undefined) {
				await ffmpeg.writeFile(
					'frame1.png',
					await fetchFile(`${window.location.origin}/${frameSpotifyData[frame1Type].frameUrl}`)
				);
				await ffmpeg.writeFile(
					'frame2.png',
					await fetchFile(`${window.location.origin}/${frameSpotifyData[frame2Type].frameUrl}`)
				);
			}
		} else {
			await ffmpeg.writeFile(
				'frame.png',
				await fetchFile(`${window.location.origin}/${frameData.frameUrl}`)
			);
		}
		let imageArgs = [];
		let scaleArgs = [];
		let increment = 1;
		if (frameData.useDiff) {
			scaleArgs.push('[0:v]scale=1488:1050[v0];');
			increment = 2;
		}
		for (let index = 0; index < $imagesBlobArray.length; index++) {
			imageArgs.push(`-i`);
			imageArgs.push(`${index}.png`);
			console.log($imagesBlobArray.length);
			await ffmpeg
				.writeFile(`${index}.png`, await fetchFile($imagesBlobArray[index]))
				.then((val) => {
					scaleArgs.push(
						`[${index + increment}:v]scale=${frameData.width}:${frameData.height}[v${index + increment}];`
					);
				});
		}
		// ...(frameData.useDiff ? ['frame1.png', '-i', 'frame2.png'] : ['frame.png']), // Input background image
		await ffmpeg.exec([
			'-i',
			...(frameData.useDiff ? ['frame1.png', '-i', 'frame2.png'] : ['frame.png']), // Input background image

			...imageArgs,
			'-filter_complex',
			scaleArgs.join('') +
				`[${frameData.useDiff ? 'v0' : '0:v'}][v${increment}]overlay=x=${frameData.coordinates[0].x}:y=${frameData.coordinates[0].y}[v5]` +
				// `[v4][v2]overlay=x=${frameData.coordinates[1].x}:y=${frameData.coordinates[1].y}[v5];` +
				// `[v5][v3]overlay=x=${frameData.coordinates[2].x}:y=${frameData.coordinates[2].y}[v6];` +
				frameData.coordinates
					.map((coord, i) => {
						if (i === 0) {
							return;
						}
						return `[v${i + 4}][v${i + increment}]overlay=x=${coord.x}:y=${coord.y}[v${i + 4 + increment}]`;
					})
					.join(';') +
				(frameData.useDiff
					? `;[v7][0:v]overlay=x=0:y=0[v8];[v8][1:v]overlay=x=744:y=0[v10]`
					: `;[v${frameData.frames + 4}][0:v]overlay=x=0:y=0[v10]`),
			'-map',
			'[v10]', // Map the final overlay stream
			'-y',
			'out.png' // Output PNG file
		]);
		console.log(
			'command',
			[
				'-i',
				...(frameData.useDiff ? ['frame1.png', '-i', 'frame2.png'] : ['frame.png']), // Input background image

				...imageArgs,
				'-filter_complex',
				scaleArgs.join('') +
					`[${frameData.useDiff ? 'v0' : '0:v'}][v${increment}]overlay=x=${frameData.coordinates[0].x}:y=${frameData.coordinates[0].y}[v5]` +
					// `[v4][v2]overlay=x=${frameData.coordinates[1].x}:y=${frameData.coordinates[1].y}[v5];` +
					// `[v5][v3]overlay=x=${frameData.coordinates[2].x}:y=${frameData.coordinates[2].y}[v6];` +
					frameData.coordinates
						.map((coord, i) => {
							if (i === 0) {
								return;
							}
							return `[v${i + 4}][v${i + increment}]overlay=x=${coord.x}:y=${coord.y}[v${i + 4 + increment}]`;
						})
						.join(';') +
					(frameData.useDiff
						? `;[v7][0:v]overlay=x=0:y=0[v8];[v8][1:v]overlay=x=744:y=0[v10]`
						: `;[v7][0:v]overlay=x=0:y=0[v10]`),
				'-map',
				'[v10]', // Map the final overlay stream
				'-y',
				'out.png' // Output PNG file
			].join(' ')
		);
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
		formData.append('frame1', frame1Type);
		formData.append('frame2', frame2Type);

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
		if ($count < frames) {
			startCapturing();
			console.log('sup');
		}
		if ($count === frames) {
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
		<div>
			<select bind:value={frameType}>
				{#each frameSelection as frameStyle}
					<option value={frameStyle}>
						{frameStyle}
					</option>
				{/each}
			</select>
			{#if frameType === 'spotify'}
				<div>
					<select bind:value={frame1Type}>
						{#each frameSpotifySelection as spotifyFrameStyle}
							<option value={spotifyFrameStyle}>
								{spotifyFrameStyle}
							</option>
						{/each}
					</select>
					<select bind:value={frame2Type}>
						{#each frameSpotifySelection as spotifyFrameStyle}
							<option value={spotifyFrameStyle}>
								{spotifyFrameStyle}
							</option>
						{/each}
					</select>
				</div>
			{/if}
			{#if frameType.includes('single')}
				<div>
					<select bind:value={frame1Type}>
						{#each frameLandscapeSelection as spotifyFrameStyle}
							<option value={spotifyFrameStyle}>
								{spotifyFrameStyle}
							</option>
						{/each}
					</select>
					<select bind:value={frame2Type}>
						{#each frameLandscapeSelection as spotifyFrameStyle}
							<option value={spotifyFrameStyle}>
								{spotifyFrameStyle}
							</option>
						{/each}
					</select>
				</div>
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

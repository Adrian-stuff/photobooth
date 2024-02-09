<script lang="ts">
	import { base64ToBlob, getRandomNumber } from '$lib';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	export let onCapture: (dataUrl: string, file: File) => void;
	export let onMediaUrl: (dataUrl: string, file: File) => void;
	let video: HTMLVideoElement;
	export function captureImage() {
		const canvas = document.createElement('canvas');
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		ctx.drawImage(video, 0, 0);

		canvas.toBlob((blob) => {
			const dataUrl = URL.createObjectURL(blob as Blob);
			const file = new File([blob as Blob], `image-${getRandomNumber(0, 10)}`);
			if (onCapture) {
				onCapture(dataUrl, file);
			}
		}, 'image/png');
	}

	let mediaRecorder: MediaRecorder | null = null;
	let chunks: Blob[] = []; // Store video chunks
	const isRecording = writable(false);

	export function startRecording() {
		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then((stream) => {
				mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
				mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
				mediaRecorder.onstop = () => {
					const blob = new Blob(chunks, { type: 'video/webm' });
					const url = URL.createObjectURL(blob);
					const file = new File([blob], `video-${getRandomNumber(0, 10)}`);
					// const reader = new FileReader();
					// reader.readAsDataURL(blob);
					// reader.onloadend = function () {
					// 	const base64data = reader.result as string;
					// 	onMediaUrl(base64data);
					// };
					onMediaUrl(url, file);
				};
				mediaRecorder.start();
				isRecording.set(true);
			})
			.catch((err) => {
				console.error('Error accessing webcam:', err);
			});
	}

	export function stopRecording() {
		if (mediaRecorder && mediaRecorder.state === 'recording') {
			mediaRecorder.stop();
			chunks = [];
			isRecording.set(false);
		}
	}
	onMount(() => {
		chunks = [];
		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then((stream) => {
				video.srcObject = stream;
				video.play();
			})
			.catch((err) => {
				console.error('Error accessing webcam:', err);
			});
	});
</script>

<video bind:this={video} playsinline autoplay muted></video>

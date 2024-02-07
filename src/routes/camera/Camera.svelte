<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	export let onCapture: (dataUrl: string) => void;
	export let onMediaUrl: (dataUrl: string) => void;
	let video: HTMLVideoElement;
	let imageBlob = writable(null);

	export function captureImage() {
		const canvas = document.createElement('canvas');
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		ctx.drawImage(video, 0, 0);
		const dataUrl = canvas.toDataURL('image/png'); // Remove header

		if (onCapture) {
			onCapture(dataUrl);
		}
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
					const reader = new FileReader();
					reader.readAsDataURL(blob);
					reader.onloadend = function () {
						const base64data = reader.result as string;
						onMediaUrl(base64data);
					};
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

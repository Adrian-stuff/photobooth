<script lang="ts">
	import { app } from '$lib/firebase';
	import { getDownloadURL, getStorage, ref } from 'firebase/storage';

	let code: string;
	let imageDownloadURL: string;
	let videoDownloadURL: string;
	let error: string = '';

	async function onSubmit() {
		if (code.length !== 6) return;
		console.log(code);
		error = '';
		const storage = getStorage(app);
		try {
			videoDownloadURL = await getDownloadURL(ref(storage, `uploads/${code}/final.mp4`));
			imageDownloadURL = await getDownloadURL(ref(storage, `uploads/${code}/image.png`));
		} catch (errorMsg) {
			console.log('error getting downloadURL');
			error = 'Invalid Code';
		}
		code = '';
	}
</script>

<title>ICT Club Photobooth</title>
<body>
	<div class="container">
		<form on:submit|preventDefault={onSubmit}>
			<h1>Enter Code</h1>
			<div>
				<input bind:value={code} type="text" minlength="6" maxlength="6" />
				<button type="submit">Enter</button>
			</div>
		</form>

		{#if imageDownloadURL && error.length === 0}
			<!-- content here -->
			<div class="output-container">
				<img src={imageDownloadURL} alt="preview" />
				<button>Download Image</button>
				<!-- svelte-ignore a11y-media-has-caption -->
				<video src={videoDownloadURL} autoplay loop></video>
				<button>Download Video</button>
			</div>
		{/if}
		{#if error}
			<h1>{error}</h1>
		{/if}
	</div>
	<footer>ICT CLUB @ 2024</footer>
</body>

<style>
	:root {
		font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
		line-height: 1.5;
		font-weight: 400;
		color-scheme: light dark;
		color: rgba(255, 255, 255, 0.87);
		background-color: #242424;
		font-synthesis: none;
		text-rendering: optimizeLegibility;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	body {
		margin: 0;
		display: flex;
		flex-direction: column;
		justify-content: start;
		min-height: 100vh;
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
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		flex: 1;
	}
	.container > form {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		gap: 5px;
	}
	.container > form > div > input {
		height: 30px;
		font-size: 20px;
	}

	.output-container {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		margin: 10px 0;
		gap: 10px;
	}
	.output-container > img,
	video {
		width: 250px;
	}
	footer {
		text-align: center;
		color: gray;
	}
</style>

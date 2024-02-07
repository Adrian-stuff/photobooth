<script lang="ts">
	export let onTimeEnd: () => void;
	export let initialSeconds: number; // Initial countdown value (in seconds)

	let interval: any; // Stores the setInterval reference
	let currentSeconds: number = initialSeconds;
	let shouldContinue: boolean = true;
	$: countdownValue = currentSeconds;

	export function startCountdown() {
		shouldContinue = true;
		currentSeconds = initialSeconds;

		// Clear any existing interval
		// clearInterval(interval);
		interval = setInterval(() => {
			if (!shouldContinue) return clearInterval(interval);
			if (currentSeconds > 0) {
				currentSeconds--;
			} else {
				onTimeEnd();
				clearInterval(interval);
			}
		}, 1000); // Update every second
	}

	export function stopCountdown() {
		shouldContinue = false;
		clearInterval(interval);
		currentSeconds = initialSeconds;
	}
</script>

<h1>{countdownValue}</h1>

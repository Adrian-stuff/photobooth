<script lang="ts">
	export let onTimeEnd: () => void;
	export let initialSeconds: number;

	let interval: any;
	let currentSeconds: number = initialSeconds;
	let isStopped: boolean = false; // Use isStopped instead of shouldContinue
	$: countdownValue = currentSeconds;

	export function startCountdown() {
		if (!isStopped) {
			// Check if already stopped
			currentSeconds = initialSeconds;
			clearExistingInterval();

			interval = setInterval(() => {
				if (currentSeconds > 0) {
					currentSeconds--;
				} else {
					onTimeEnd();
					// Reset automatically after ending, but don't restart immediately
				}
			}, 1000); // Update every second
		}
	}

	export function stopCountdown() {
		isStopped = true;
		clearExistingInterval();
	}

	export function resetCounter() {
		currentSeconds = initialSeconds;

		if (!isStopped) {
			// Restart if not already stopped
			startCountdown();
		}
	}

	export function restartCountdown() {
		// Set both flags to ensure full restart
		isStopped = false;
		resetCounter(); // Reset seconds and potentially start the timer
	}

	function clearExistingInterval() {
		if (interval) {
			clearInterval(interval);
			interval = undefined;
		}
	}
</script>

<div class={`countdown-overlay `}>
	{countdownValue === 0 ? 'Smile!' : countdownValue}
</div>

<style>
	.countdown-overlay {
		position: absolute;

		font-size: 20rem;
		font-weight: bold;
		color: white;
		/* background-color: rgba(0, 0, 0, 0.8); */
		/* padding: 20px; */
		/* border-radius: 8px; */
		animation: countdownAnimation 1s ease-out;
	}

	.countdown-overlay.hidden {
		display: none;
	}

	@keyframes countdownAnimation {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.5);
		}
		100% {
			transform: scale(1);
		}
	}
</style>

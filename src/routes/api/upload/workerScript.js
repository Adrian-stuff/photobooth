import { spawn } from 'child_process';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { workerData, parentPort } from 'worker_threads';
/**
 * @param {string} code
 * @param {import('$lib').FrameType} frameData
 * @param {string[] | undefined} frameSpotify
 */
export function generateVideo(code, frameData, frameSpotify) {
	return /** @type {Promise<void>} */ (
		new Promise(async (resolve, reject) => {
			let imageArgs = [];
			let scaleArgs = [];
			let increment = 1;
			if (frameData.useDiff) {
				// scaleArgs.push('');
				scaleArgs.push('[0:v]scale=1488:1050[v0];');

				increment = 2;
			}
			for (let index = 0; index < frameData.frames; index++) {
				imageArgs.push(`-i`);
				imageArgs.push(`static/uploads/${code}/video-${index}.webm`);
				scaleArgs.push(
					`[${index + increment}:v]scale=${frameData.width}:${frameData.height}[v${index + increment}];`
				);
			}

			const ffmpegProcess = spawn('ffmpeg', [
				'-i',
				...(frameData.useDiff && frameData.frameTypes && frameSpotify
					? [
							`static/${frameData.frameTypes[frameSpotify[0]].frameUrl}`,
							'-i',
							`static/${frameData.frameTypes[frameSpotify[1]].frameUrl}`
						]
					: [`static/${frameData.frameUrl}`]), // Input background image

				...imageArgs,
				'-filter_complex',
				scaleArgs.join('') +
					`[${frameData.useDiff ? 'v0' : '0:v'}][v${increment}]overlay=x=${frameData.coordinates[0].x}:y=${frameData.coordinates[0].y}[v5]` + // Overlay scaled video 0 on the background
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
				'[v10]',
				'-y',
				`static/uploads/${code}/out.mp4`
			]);

			// concat
			// ffmpeg -i out.mp4 -i output.mp4 -filter_complex "[0:v:0][1:v:0]concat=n=2:v=1[outv]" -map "[outv]" final.mp4
			// convert into longer duration
			// ffmpeg -loop 1 -framerate 30 -i sample.png -c:v libx264 -t 3 -pix_fmt yuv420p output.mp4

			ffmpegProcess.stdout.on('data', (data) => {
				console.log(`stdout: ${data}`);
			});

			ffmpegProcess.stderr.on('data', (data) => {
				console.error(`stderr: ${data}`);
			});

			ffmpegProcess.on('close', async (statusCode) => {
				if (statusCode === 0) {
					console.log('FFmpeg process finished successfully');
					resolve();
				} else {
					reject(`FFmpeg process exited with code ${statusCode}`);
				}
			});

			ffmpegProcess.on('error', (err) => {
				reject(`Error spawning FFmpeg process: ${err.message}`);
			});
		})
	);
}

/**
 * @param {string} code
 */
export function concatVideo(code) {
	return /** @type {Promise<void>} */ (
		new Promise((resolve, reject) => {
			const ffmpegProcess = spawn('ffmpeg', [
				'-i',
				`static/uploads/${code}/out.mp4`,
				'-i',
				`static/uploads/${code}/still.mp4`,
				'-filter_complex',
				'[0:v:0][1:v:0]concat=n=2:v=1[outv]',
				'-map',
				'[outv]',
				`static/uploads/${code}/final.mp4`
			]);
			// concat
			// ffmpeg

			ffmpegProcess.stdout.on('data', (data) => {
				console.log(`stdout: ${data}`);
			});

			ffmpegProcess.stderr.on('data', (data) => {
				console.error(`stderr: ${data}`);
			});

			ffmpegProcess.on('close', (code) => {
				if (code === 0) {
					console.log('FFmpeg process finished successfully');
					resolve();
				} else {
					reject(`FFmpeg process exited with code ${code}`);
				}
			});

			ffmpegProcess.on('error', (err) => {
				reject(`Error spawning FFmpeg process: ${err.message}`);
			});
		})
	);
}

/**
 * @param {string} code
 */
export function generateStillVideo(code) {
	return /** @type {Promise<void>} */ (
		new Promise((resolve, reject) => {
			const ffmpegProcess = spawn('ffmpeg', [
				'-loop',
				'1',
				'-framerate',
				'30',
				'-i',
				`static/uploads/${code}/image.png`, // Input video 0
				'-vf',
				'scale=1488:1050:force_original_aspect_ratio=decrease,pad=1488:1050:(ow-iw)/2:(oh-ih)/2,setsar=1',
				'-c:v',
				'libx264',
				'-t',
				'3',
				'-pix_fmt',
				'yuv420p',
				`static/uploads/${code}/still.mp4`
			]);
			// concat
			// ffmpeg -i out.mp4 -i output.mp4 -filter_complex "[0:v:0][1:v:0]concat=n=2:v=1[outv]" -map "[outv]" final.mp4

			ffmpegProcess.stdout.on('data', (data) => {
				console.log(`stdout: ${data}`);
			});

			ffmpegProcess.stderr.on('data', (data) => {
				console.error(`stderr: ${data}`);
			});

			ffmpegProcess.on('close', async (statusCode) => {
				if (statusCode === 0) {
					console.log('FFmpeg process finished successfully');

					resolve();
				} else {
					reject(`FFmpeg process exited with code ${statusCode}`);
				}
			});

			ffmpegProcess.on('error', (err) => {
				reject(`Error spawning FFmpeg process: ${err.message}`);
			});
		})
	);
}

(async () => {
	const frameData = workerData.frameData;
	const uuid = workerData.uuid;
	const frameSpotifyData = workerData.frameSpotifyData;
	console.log('frame', workerData);
	if (frameData.useDiff) {
		await parentPort?.postMessage('done');
		return;
	}
	await generateVideo(uuid, frameData, frameSpotifyData);
	await generateStillVideo(uuid);
	await concatVideo(uuid);
	await unlink(`static/uploads/${uuid}/still.mp4`);
	await unlink(`static/uploads/${uuid}/out.mp4`);

	await parentPort?.postMessage('done');
})().catch(async (e) => {
	await parentPort?.postMessage('done');
});

import { spawn } from 'child_process';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { workerData, parentPort } from 'worker_threads';
/**
 * @param {string} code
 * @param {import('$lib').FrameType} frameData
 */
export function generateVideo(code, frameData) {
	return /** @type {Promise<void>} */ (
		new Promise(async (resolve, reject) => {
			const ffmpegProcess = spawn('ffmpeg', [
				'-i',
				`static/${frameData.frameUrl}`,
				'-i',
				`static/uploads/${code}/video-0.webm`, // Input video 0
				'-i',
				`static/uploads/${code}/video-1.webm`, // Input video 1
				'-i',
				`static/uploads/${code}/video-2.webm`, // Input video 2
				'-filter_complex',
				`[1:v]scale=-1:${frameData.height}[v1];` + // Scale video 0 to 200x180
					`[2:v]scale=-1:${frameData.height}[v2];` + // Scale video 1 to 200x180
					`[3:v]scale=-1:${frameData.height}[v3];` + // Scale video 2 to 200x180
					`[0:v][v1]overlay=x=${frameData.coordinates[0].x}:y=${frameData.coordinates[0].y}[v4]` + // Overlay scaled video 0 on the background
					frameData.coordinates
						.map((coord, i) => {
							if (i === 0) {
								return;
							}
							return `[v${i + 3}][v${i + 1}]overlay=x=${coord.x}:y=${coord.y}[v${i + 4}]`;
						})
						.join(';') +
					';[v6][0:v]overlay=x=0:y=0[v7]', // TODO: maybe add more fps
				'-map',
				'[v7]',
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
	console.log('frame', workerData);
	await generateVideo(uuid, frameData);
	await generateStillVideo(uuid);
	await concatVideo(uuid);
	await unlink(`static/uploads/${uuid}/still.mp4`);
	await unlink(`static/uploads/${uuid}/out.mp4`);

	await parentPort?.postMessage('done');
})();

import { blobToBase64, blobUrlToBuffer, db, generateRandomUUID, type FrameType } from '$lib';
import { fail, json, type RequestEvent } from '@sveltejs/kit';
import { writeFile, mkdir, unlink, readFile } from "fs/promises"
import { Worker } from "worker_threads"
import { framesInfo } from '$lib';
const address = "http://localhost:5173"

function runWorkerThread(image: File, imagesArray: File[], videosArray: File[], uuid: string, frameData: FrameType) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./src/routes/api/upload/workerScript.js', { workerData: { image, imagesArray, videosArray, uuid, frameData } });

    worker.on('message', async (message) => {
      const imageFile = new Blob([await readFile(`static/uploads/${uuid}/image.png`)])
      const videoFile = new Blob([await readFile(`static/uploads/${uuid}/final.mp4`)])
      await uploadFile(uuid, "image.png", imageFile)
      await uploadFile(uuid, "final.mp4", videoFile)

      resolve(message);
    });

    worker.on('error', (error) => {
      reject(error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from '$lib/firebase';



async function uploadFile(code: string, fileName: string, file: Blob) {

  // Create a root reference
  const storage = getStorage(app);

  // Create a reference to 'mountains.jpg'
  const folderRef = ref(storage, `uploads/${code}/${fileName}`);
  await uploadBytes(folderRef, file)

}
export async function POST({ request }: RequestEvent) {
  const uuid = generateRandomUUID(6)
  const formData = Object.fromEntries(await request.formData());
  console.log(formData)
  const frameType = formData.frameType as string
  console.log(frameType)
  const image = formData.image as File
  const frameData = framesInfo[frameType]
  console.log(framesInfo[frameType])
  const videosArray: File[] = []
  const imagesArray: File[] = []

  for (let index = 0; index < frameData.frames; index++) {
    videosArray.push(formData[`video-${index}`] as File)
    imagesArray.push(formData[`image-${index}`] as File)

    // console.log()
  }
  console.log(videosArray)

  await mkdir(`static/uploads/${uuid}`);
  await writeFile(
    `static/uploads/${uuid}/image.png`,
    Buffer.from(await image.arrayBuffer())
  );

  videosArray.map(
    async (
      val,
      index
    ) => {
      await writeFile(
        `static/uploads/${uuid}/video-${index}.webm`,
        Buffer.from(await val.arrayBuffer())
      );
    }
  );
  imagesArray.map(
    async (
      val,
      index
    ) => {
      await writeFile(
        `static/uploads/${uuid}/image-${index}.png`,
        Buffer.from(await val.arrayBuffer())
      );
    }
  );
  // generateVideo(uuid, frameUrl).then(val => {
  //   generateStillVideo(uuid).then(val => concatVideo(uuid).then(async val => {
  //     await unlink("static/")
  //   }))
  // }).catch(error => console.error(error))
  // await generateVideo(uuid, frameUrl)
  // await generateStillVideo(uuid)
  // await concatVideo(uuid)
  runWorkerThread(image, imagesArray, videosArray, uuid, frameData)

  await db.push(`/uploads/${uuid}`, { code: uuid, frameType: frameType, frames: frameData.frames })

  return json({
    success: true,
    code: uuid
  });

}
import { db, transformJson } from '$lib';
import { app } from '$lib/firebase';
import { error, fail, json, type RequestEvent } from '@sveltejs/kit';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { readFile } from "fs/promises"
async function uploadFile(code: string, fileName: string, file: Blob) {

  // Create a root reference
  const storage = getStorage(app);

  // Create a reference to 'mountains.jpg'
  const folderRef = ref(storage, `uploads/${code}/${fileName}`);
  await uploadBytes(folderRef, file)

}
export async function GET({ params, fetch }: RequestEvent) {
  // const code = params.code/
  try {
    // const data = await db.getData(`/failed`) as string[]
    const res = await fetch("http://localhost:5174/api/getImage")
    const data = Object.keys(await res.json())
    for (let index = 0; index < data.length; index++) {

      try {
        let image = await readFile(`static/uploads/${data[index]}/image.png`)
        if (image) {
          const imageFile = new Blob([image])
          await uploadFile(data[index], "image.png", imageFile)
        }
        let video = await readFile(`static/uploads/${data[index]}/final.mp4`)
        if (video) {
          const videoFile = new Blob([video])
          await uploadFile(data[index], "final.mp4", videoFile)
        }
        // await db.delete(`/failed[${index}]`)
      } catch (e) {
        console.log(e)
      }
    }
    console.log(data)
    return json({ msg: "done uploading" });
  } catch (dataerror) {
    return json({ msg: "no failed" })
  }

}
import { db } from '$lib';
import PDFDocument from 'pdfkit';
import BlobStream from 'blob-stream';
import { writeFile } from "node:fs/promises"
import { error, fail, json, type RequestEvent } from '@sveltejs/kit';
// async function blobToBase64(blob: Blob) {
//   return new Promise<string>(async (resolve, reject) => {
//     const b64 = await fetch(url)
//       .then((response) => response.buffer())
//       .then((buffer) => {
//         const b64 = buffer.toString('base64');
//         return b64;
//       })
//       .catch(console.error);
//   });
// }
export async function GET({ params }: RequestEvent) {
  try {
    const code = params.code

    const data = await db.getData(`/uploads/${code}`)
    const doc = new PDFDocument({
      size: [289.1343, 425.1975],
      // size: "A4",

      margins: { // by default, all are 72
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    });

    // Create a Promise to handle asynchronous operations
    const promise = new Promise((resolve, reject) => {
      // Pipe the document to a blob stream
      const stream = doc.pipe(BlobStream());

      // Add content to the document
      doc.image(`static/uploads/${data.code}/image.png`, 3, 3, { width: 28.3465 * 5, height: 425.1975, });
      doc.image(`static/uploads/${data.code}/image.png`, 145, 3, { width: 28.3465 * 5, height: 425.1975, });

      // End the document and handle stream finish event
      doc.end();
      stream.on('finish', async () => {
        // Get the blob and blob URL
        const blob = stream.toBlob('application/pdf');
        const url = stream.toBlobURL('application/pdf');
        // Resolve the Promise with the blob URL
        // const b64 = await fetch(url)
        //   .then((response) => response.arrayBuffer())
        //   .then((buffer) => {
        //     const b64 = Buffer.from(buffer).toString('base64');
        //     return b64;
        //   })
        //   .catch(console.error);
        await writeFile(`static/uploads/${data.code}/pdfFile.pdf`, Buffer.from(await blob.arrayBuffer()))
        resolve(`static/uploads/${data.code}/pdfFile.pdf`)
      });

      // Handle potential errors during stream creation or finishing
      stream.on('error', (error) => {
        reject(error);
      });
    });
    const src = await promise;
    return json({ ...data, src });
  } catch (dataerror) {
    console.log(dataerror)
    return error(404, "code does not exist")
  }

}
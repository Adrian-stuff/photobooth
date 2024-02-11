
export interface FrameType {
  frames: number
  frameUrl: string
  width: number
  height: number
  useDiff: boolean
  frameTypes?: SpotifyType
  coordinates: { x: number, y: number }[]
}
interface SpotifyType {
  [key: string]: { frameUrl: string }
}
interface FrameInfo {
  [key: string]: FrameType;
}
export const framesInfo: FrameInfo = {
  "frame-1": {
    frames: 3,
    frameUrl: `frames/1.png`,
    useDiff: false,
    width: -1,
    height: 424,
    coordinates: [
      { x: 67, y: 358 },
      { x: 67, y: 849 },
      { x: 67, y: 1340 }
    ],

  },
  "frame-2": {
    frames: 3,
    frameUrl: `frames/1.png`,
    useDiff: false,
    width: -1,
    height: 424,
    coordinates: [
      { x: 13, y: 90 },
      { x: 13, y: 550 },
      { x: 13, y: 1013 }
    ]
  },
  "frame-3": {
    frames: 3,
    frameUrl: `frames/2.png`,
    useDiff: false,
    width: -1,
    height: 424,
    coordinates: [
      { x: 13, y: 90 },
      { x: 13, y: 550 },
      { x: 13, y: 1013 }
    ]
  },
  "frame-4": {
    frames: 3,
    frameUrl: `frames/3.png`,
    useDiff: false,
    width: -1,
    height: 424,
    coordinates: [
      { x: 13, y: 90 },
      { x: 13, y: 550 },
      { x: 13, y: 1013 }
    ]
  },
  "spotify": {
    frames: 2,
    frameUrl: `frames/1.png`,
    useDiff: true,
    frameTypes: {
      "pasilyo": {
        frameUrl: `frames/spotify/pasilyo.png`,
      },
      "until": {
        frameUrl: `frames/spotify/until.png`,
      }
    },
    width: -1,
    height: 578,
    coordinates: [
      { x: 65, y: 112 },
      { x: 65 + 744, y: 112 },
    ]
  },
}

// place files you want to import through the `$lib` alias in this folder.
export function generateRandomUUID(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let uuid = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uuid += characters.charAt(randomIndex);
  }

  return uuid;
}
export async function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string); // Remove data: prefix
      } else {
        reject(new Error('Failed to read blob'));
      }
    };
    reader.readAsDataURL(blob);
  });
} export async function blobUrlToBuffer(blobUrl: string): Promise<Buffer> {
  const response = await fetch(blobUrl);
  const blobData = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result instanceof ArrayBuffer) {
        const buffer = Buffer.from(reader.result);
        resolve(buffer);
      } else {
        reject(new Error('Failed to convert blob to buffer.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading blob data.'));
    };

    reader.readAsArrayBuffer(blobData);
  });
}

export function getRandomNumber(min: number, max: number): number {
  if (min > max) {
    throw new Error('Invalid range: min should be less than or equal to max');
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function base64ToBlob(base64String: string, contentType: string = ''): Blob {
  const buffer = Buffer.from(base64String, 'base64');


  const byteArray = new Uint8Array(buffer).buffer;
  return new Blob([byteArray], { type: contentType });
}

import { browser } from '$app/environment';
import { JsonDB, Config } from 'node-json-db';
let db: JsonDB
if (!browser) {
  db = new JsonDB(new Config("myDataBase", true, true, '/'));
}
export { db }

export interface codeObject {
  code: string;
  frameType: string;
}

export function transformJson(json: Record<string, codeObject>): codeObject[] {
  const result: codeObject[] = [];

  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      const { code, frameType } = json[key];
      result.push({ code, frameType });
    }
  }

  return result;
}
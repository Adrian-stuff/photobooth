
export interface FrameType {
  frames: number
  frameUrl: string
  width: number
  height: number
  useDiff: boolean
  // isCropped: boolean
  // cropCoordinates: 
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
  "korean-1": {
    frames: 3,
    frameUrl: `frames/1.png`,
    useDiff: false,
    width: -1,
    height: 430,
    coordinates: [
      { x: 13, y: 90 },
      { x: 13, y: 550 },
      { x: 13, y: 1013 }
    ]
  },
  "korean-2": {
    frames: 3,
    frameUrl: `frames/2.png`,
    useDiff: false,
    width: -1,
    height: 430,
    coordinates: [
      { x: 13, y: 90 },
      { x: 13, y: 550 },
      { x: 13, y: 1013 }
    ]
  },
  "korean-3": {
    frames: 3,
    frameUrl: `frames/3.png`,
    useDiff: false,
    width: -1,
    height: 430,
    coordinates: [
      { x: 13, y: 90 },
      { x: 13, y: 550 },
      { x: 13, y: 1013 }
    ]
  },
  "hvd-black-vertical": {
    frames: 3,
    frameUrl: `frames/jirah/vertical/hvd black vertical.png`,
    useDiff: false,
    width: -1,
    height: 417,
    coordinates: [
      { x: 73, y: 328 },
      { x: 73, y: 765 },
      { x: 73, y: 1199 }
    ]
  },
  "hvd-white-vertical": {
    frames: 3,
    frameUrl: `frames/jirah/vertical/hvd white vertical.png`,
    useDiff: false,
    width: -1,
    height: 417,
    coordinates: [
      { x: 73, y: 316 },
      { x: 73, y: 753 },
      { x: 73, y: 1192 }
    ]
  },
  // "landscape-black-1": { //TODO:
  //   frames: 2,
  //   frameUrl: `frames/jirah/landscape/black bg.png`,
  //   useDiff: false,
  //   width: -1,
  //   height: 695,
  //   coordinates: [
  //     { x: -100, y: 55 },
  //     { x: 492, y: 55 },
  //   ]
  // },
  // "landscape-2": {
  //   frames: 2,
  //   frameUrl: `frames/jirah/landscape/heart black bg.png`,
  //   useDiff: false,
  //   width: -1,
  //   height: 424,
  //   coordinates: [
  //     { x: 45, y: 58 },
  //     { x: 627, y: 58 },
  //   ]
  // },
  // "landscape-3": {
  //   frames: 2,
  //   frameUrl: `frames/jirah/landscape/heart white bg.png`,
  //   useDiff: false,
  //   width: -1,
  //   height: 424,
  //   coordinates: [
  //     { x: 45, y: 58 },
  //     { x: 627, y: 58 },
  //   ]
  // },
  // "landscape-4": {
  //   frames: 2,
  //   frameUrl: `frames/jirah/landscape/instagram.png`,
  //   useDiff: false,
  //   width: -1,
  //   height: 424,
  //   coordinates: [
  //     { x: 45, y: 58 },
  //     { x: 627, y: 58 },
  //   ]
  // },
  // "landscape-5": {
  //   frames: 2,
  //   frameUrl: `frames/jirah/landscape/white bg.png`,
  //   useDiff: false,
  //   width: -1,
  //   height: 424,
  //   coordinates: [
  //     { x: 45, y: 58 },
  //     { x: 627, y: 58 },
  //   ]
  // },
  "pink-heart": {
    frames: 1,
    frameUrl: `frames/jirah/single/pink heart.png`,
    useDiff: false,
    width: -1,
    height: 837,
    coordinates: [
      { x: -200, y: 77 },
    ]
  },
  "single-polaroid-black": {
    frames: 1,
    frameUrl: `frames/jirah/single/single polaroid black.png`,
    useDiff: false,
    width: -1,
    height: 837,
    coordinates: [
      { x: -200, y: 26 },
    ]
  },
  "single-polaroid-white": {
    frames: 1,
    frameUrl: `frames/jirah/single/single polaroid white.png`,
    useDiff: false,
    width: -1,
    height: 839,
    coordinates: [
      { x: -200, y: 25 },
    ]
  },
  "single-hvd-pink": {
    frames: 1,
    frameUrl: `frames/jirah/single/single hvd pink.png`,
    useDiff: false,
    width: -1,
    height: 640,
    coordinates: [
      { x: -30, y: 303 },
    ]
  },
  "single-hvd-lightpink": {
    frames: 1,
    frameUrl: `frames/jirah/single/single hvd lightpink.png`,
    useDiff: false,
    width: -1,
    height: 640,
    coordinates: [
      { x: -30, y: 264 },
    ]
  },
  "single-hvd-blue": {
    frames: 1,
    frameUrl: `frames/jirah/single/single hvd blue.png`,
    useDiff: false,
    width: -1,
    height: 640,
    coordinates: [
      { x: -30, y: 303 },
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
      "until i found you": {
        frameUrl: `frames/spotify/until i found you.png`,
      },
      "always": {
        frameUrl: "frames/spotify/always.png"
      },
      "fallen": {
        frameUrl: "frames/spotify/fallen.png"
      },
      "love": {
        frameUrl: "frames/spotify/love.png"
      },
      "lover": {
        frameUrl: "frames/spotify/lover.png"
      },
      "my love my all mine": {
        frameUrl: "frames/spotify/my love mine all mine.png",
      },
      "valentine": {
        frameUrl: "frames/spotify/valentine.png"
      },
      "we fell in love in october": {
        frameUrl: "frames/spotify/we fell in love in october.png"
      },
      "when i met you": {
        frameUrl: "frames/spotify/when i met you.png"
      }
    },
    width: -1,
    height: 578,
    coordinates: [
      { x: 20, y: 112 },
      { x: 20 + 744, y: 112 },
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
}

export async function blobUrlToBuffer(blobUrl: string): Promise<Buffer> {
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
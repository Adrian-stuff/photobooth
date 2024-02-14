import { error } from '@sveltejs/kit';
import type { FrameType } from '$lib';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  if (params.code) {
    try {
      const res = await fetch(`/api/getImage/${params.code}`);
      const resData: { code: string, frameType: string, frames: number } = await res.json();
      return { code: `${params.code}`, frameData: resData };
    } catch (e) {
      return error(404, 'Not found');

    }
  }
  return error(404, 'Not found');

}
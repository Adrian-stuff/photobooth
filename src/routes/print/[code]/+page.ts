import { error } from '@sveltejs/kit';
import type { FrameType } from '$lib';
/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  if (params.code) {
    const res = await fetch(`/api/getImage/${params.code}`);
    const resData: FrameType = await res.json();
    return { code: `${params.code}`, frameData: resData };
  }
  return error(404, 'Not found');
}
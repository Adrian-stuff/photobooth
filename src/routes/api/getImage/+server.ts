import { db } from '$lib';
import { error, fail, json, type RequestEvent } from '@sveltejs/kit';
export async function GET({ params }: RequestEvent) {
  // const code = params.code/
  try {
    const data = await db.getData(`/uploads`)

    console.log(data)
    return json(data);
  } catch (dataerror) {
    return error(404, "no uploads")
  }

}
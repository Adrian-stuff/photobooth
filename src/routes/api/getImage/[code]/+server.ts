import { db } from '$lib';
import { error, fail, json, type RequestEvent } from '@sveltejs/kit';
export async function GET({ params }: RequestEvent) {
  try {
    const code = params.code

    const data = await db.getData(`/uploads/${code}`)
    console.log(data)
    return json(data);
  } catch (dataerror) {
    return error(404, "code does not exist")
  }

}
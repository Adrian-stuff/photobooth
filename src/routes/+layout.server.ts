import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals, url }) {
  if (env.PRIVATE_NODE_ENV === "production") {
    if (url.pathname.length !== 1) {

      redirect(307, '/');
    }
  }
}
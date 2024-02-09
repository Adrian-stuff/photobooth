import { env } from '$env/dynamic/private';
import { redirect, type Handle } from '@sveltejs/kit';
export const handle: Handle = async ({ event, resolve }) => {
  if (env.PRIVATE_NODE_ENV === "production") {
    if (event.url.pathname.startsWith('/camera')) { return redirect(301, '/'); }
    if (event.url.pathname.startsWith('/frames')) { return redirect(301, '/'); }
    if (event.url.pathname.startsWith('/uploads')) { return redirect(301, '/'); }
    if (event.url.pathname.startsWith('/print')) { return redirect(301, '/'); }
    if (event.url.pathname.startsWith('/frames')) { return redirect(301, '/'); }
    if (event.url.pathname.startsWith('/api')) { return redirect(301, '/'); }
  }


  const response = await resolve(event); return response;
};
import { sveltekit } from '@sveltejs/kit/vite';
import { type ViteDevServer, defineConfig } from 'vite'

import { Server } from 'socket.io'

const webSocketServer = {
	name: 'webSocketServer',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) return

		const io = new Server(server.httpServer)

		io.on('connection', (socket) => {
			socket.emit('eventFromServer', 'Hello, World 👋')

			socket.on("newImage", (code: string) => {
				console.log(code)
				socket.broadcast.emit('new-image', code);
			})
		})
	}
}

export default defineConfig({
	plugins: [sveltekit(), webSocketServer],
	optimizeDeps: {
		exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
	},

});

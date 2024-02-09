import { sveltekit } from '@sveltejs/kit/vite';
import { type ViteDevServer, defineConfig } from 'vite'

import { Server } from 'socket.io'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyBB0Po-wt_jWHn1d_I49P2BVXFZT1pdNUc",
	authDomain: "photobooth-84692.firebaseapp.com",
	projectId: "photobooth-84692",
	storageBucket: "photobooth-84692.appspot.com",
	messagingSenderId: "961076542149",
	appId: "1:961076542149:web:44c2c29628b056ee2c0eac"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

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

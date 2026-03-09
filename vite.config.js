import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const proxyConfig = {
  '/enchatted': {
    target: 'https://enchatted.xyz',
    changeOrigin: true,
    secure: false,
    configure: (proxy, _options) => {
      proxy.on('error', (err, _req, _res) => {
        console.log('proxy error', err);
      });
    },
  },
  '/ws': {
    target: 'wss://enchatted.xyz',
    ws: true,
    changeOrigin: true,
    secure: false,
    configure: (proxy, _options) => {
      proxy.on('error', (err, _req, _res) => {
        console.log('ws proxy error', err);
      });
    },
  },
};

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    allowedHosts: ['enchatted.xyz', 'ecf.0xf.hu', 'in.0xf.hu'],
    proxy: proxyConfig,
  },
  preview: {
    allowedHosts: ['enchatted.xyz', 'ecf.0xf.hu', 'in.0xf.hu'],
    proxy: proxyConfig,
  },
});

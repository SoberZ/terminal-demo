import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
  return defineConfig({
    plugins: [react(), mkcert()],
    server: {
      watch: {
        usePolling: true,
      },
      preview: {
        port: 5173,
        https: true,
      },
      proxy: {
        '/delegation': {
          target: process.env.VITE_API_BASE_URL,
          changeOrigin: true,
        },
        '/admin': {
          target: process.env.VITE_KEYCLOAK_URL,
          changeOrigin: true,
          secure: false,
        },
        '/state-management': process.env.VITE_API_BASE_URL,
        '/model': process.env.VITE_API_BASE_URL,
        '/data': process.env.VITE_API_BASE_URL,
      },
    },
    preview: {
      port: 5173,
    },
    // build: {
    //   rollupOptions: {
    //     external: [
    //       'node:util',
    //       'node:buffer',
    //       'node:stream',
    //       'node:net',
    //       'node:url',
    //       'node:fs',
    //       'node:path',
    //       'perf_hooks',
    //     ],
    //     output: {
    //       globals: {
    //         'node:stream': 'stream',
    //         'node:buffer': 'buffer',
    //         'node:util': 'util',
    //         'node:net': 'net',
    //         'node:url': 'url',
    //         perf_hooks: 'perf_hooks',
    //       },
    //       inlineDynamicImports: true,
    //     },
    //   },
    // },
  })
}

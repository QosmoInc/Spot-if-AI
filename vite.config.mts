import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
    root: 'src',
    build: {
        outDir: '../dist',
        rollupOptions: {
            input: {
                service_worker: resolve(__dirname, 'src/service_worker.ts'),
                content_scripts: resolve(__dirname, 'src/content_scripts.ts'),
            },
            output: { entryFileNames: '[name].js' },
        },
    },
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: '../node_modules/onnxruntime-web/dist/*.wasm',
                    dest: '.',
                },
            ],
        }),
    ],
});

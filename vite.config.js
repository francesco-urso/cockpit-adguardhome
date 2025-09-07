import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                './src/app.js': './src/app.js',
                './style.css': './src/style.css',
            },
            output: {
                entryFileNames: 'adguard.js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return 'style.css'
                    }
                    return '[name].[ext]'
                }
            }
        }
    },
    server: {
        port: 3001
    }
})
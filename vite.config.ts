import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    port: 3000,
    watch: {
      ignored: [
        '**/references/**',
        '**/public/assets/moodboard/**/*.pdf',
        '**/public/images/case-study/**',
        '**/public/images/chapters/**',
        '**/public/images/primary/**',
        '**/public/images/intro-3.svg',
        '**/public/images/cork-parts/**',
        '**/public/images/weekly-blog/**',
      ],
    },
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
})

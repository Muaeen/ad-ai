import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // WSL2 on /mnt/c doesn't emit inotify events reliably; use polling
    watch: {
      usePolling: true,
      interval: 200,
    },
    host: true, // bind to 0.0.0.0 so HMR works across WSL<->Windows
    hmr: {
      // Force client to connect via localhost to avoid IP mismatch issues
      host: 'localhost',
    },
  },
})

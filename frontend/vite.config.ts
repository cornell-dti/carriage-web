import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tsconfigPaths(), react(), tailwindcss()],
  build: {
    outDir: 'build', // CRA's default build output
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});

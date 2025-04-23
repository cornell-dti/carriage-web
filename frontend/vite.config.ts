import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr()],
  build: {
    outDir: 'build', // Keep same output directory as CRA
  },
  server: {
    port: 3000, // Use same port as CRA
  },
});

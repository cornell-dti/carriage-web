/* eslint-disable @typescript-eslint/no-var-requires */
import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'n22mn9',
  video: false,
  e2e: {
    baseUrl: 'http://localhost:3000',
  },
});

import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig(({ mode }) => {
  return {
    plugins: [angular()],
    define: {
      // Prevents "process is not defined" error in browser
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      target: 'es2020'
    }
  };
});
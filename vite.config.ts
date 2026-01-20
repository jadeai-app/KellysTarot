
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig(({ mode }) => {
  return {
    plugins: [angular()],
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      target: 'es2022',
      rollupOptions: {
        output: {
          manualChunks: {
            angular: ['@angular/core', '@angular/common', '@angular/platform-browser'],
            genai: ['@google/genai']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['@angular/common', '@angular/core', 'rxjs']
    }
  };
});

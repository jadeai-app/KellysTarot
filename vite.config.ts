import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      angular({
        jit: true,
        tsconfig: './tsconfig.json'
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      target: 'es2022',
      rollupOptions: {
        input: {
          main: './index.html'
        }
      }
    },
    optimizeDeps: {
      include: ['@angular/common', '@angular/core', 'rxjs']
    }
  };
});
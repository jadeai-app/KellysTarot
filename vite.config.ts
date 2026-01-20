
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
      target: 'es2022'
    },
    optimizeDeps: {
      include: ['@angular/common', '@angular/core', 'rxjs']
    }
  };
});

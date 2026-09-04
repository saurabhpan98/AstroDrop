import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Set base path for GitHub pages repo deployment (e.g., '/astrodrop/')
  base: process.env.NODE_ENV === 'production' ? '/AstroDrop/' : '/'
});
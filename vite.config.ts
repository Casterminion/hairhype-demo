import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

export default defineConfig({
  envPrefix: 'VITE_',

  // Supabase credentials removed for demo/case study version
  // This version uses mock data and localStorage instead of a real database
  define: {},

  plugins: [
    react(),
    {
      name: 'copy-headers',
      closeBundle() {
        if (!existsSync('dist')) {
          mkdirSync('dist', { recursive: true });
        }
        if (existsSync('_headers')) {
          copyFileSync('_headers', 'dist/_headers');
        }
      }
    }
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    cssCodeSplit: true,
    minify: 'terser',
    cssMinify: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'date-vendor': ['date-fns', 'date-fns-tz'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'admin-vendor': ['react-big-calendar', 'moment'],
          // supabase-vendor removed - using mock data instead
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 600,
    reportCompressedSize: true,
    sourcemap: false,
    assetsInlineLimit: 4096,
  },
});

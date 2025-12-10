import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

export default defineConfig({
  envPrefix: 'VITE_',

  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://wutgnceyggqygtfqtirb.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dGduY2V5Z2dxeWd0ZnF0aXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTY0ODUsImV4cCI6MjA3ODEzMjQ4NX0.areTRdHixNt01aDtVguw_wNVxBbe3ADAQ7DzNo4HDzA')
  },

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
          'supabase-vendor': ['@supabase/supabase-js'],
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

// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Proxy react-router-dom to our wrapper
        "react-router-dom": path.resolve(__dirname, "./src/lib/react-router-dom-proxy.tsx"),
        // Original react-router-dom under a different name
        "react-router-dom-original": "react-router-dom",
      },
    },
    build: {
      // Configuração otimizada para SPA
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
      // Garantir que assets são servidos corretamente
      assetsDir: 'assets',
    },
    // Configuração para desenvolvimento local
    preview: {
      port: 8080,
      host: true,
    },
    define: {
      __ROUTE_MESSAGING_ENABLED__: JSON.stringify(
        mode === 'production' 
          ? process.env.VITE_ENABLE_ROUTE_MESSAGING === 'true'
          : process.env.VITE_ENABLE_ROUTE_MESSAGING !== 'false'
      ),
    },
  }
});
// vite.config.ts
import { defineConfig } from "file:///workspace/sistema_animais_associacao/node_modules/vite/dist/node/index.js";
import react from "file:///workspace/sistema_animais_associacao/node_modules/@vitejs/plugin-react-swc/index.js";
import { componentTagger } from "file:///workspace/sistema_animais_associacao/node_modules/lovable-tagger/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/workspace/sistema_animais_associacao";
var vite_config_default = defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080
    },
    plugins: [
      react(),
      mode === "development" && componentTagger()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        // Proxy react-router-dom to our wrapper
        "react-router-dom": path.resolve(__vite_injected_original_dirname, "./src/lib/react-router-dom-proxy.tsx"),
        // Original react-router-dom under a different name
        "react-router-dom-original": "react-router-dom"
      }
    },
    define: {
      // Define environment variables for build-time configuration
      // In production, this will be false by default unless explicitly set to 'true'
      // In development and test, this will be true by default
      __ROUTE_MESSAGING_ENABLED__: JSON.stringify(
        mode === "production" ? process.env.VITE_ENABLE_ROUTE_MESSAGING === "true" : process.env.VITE_ENABLE_ROUTE_MESSAGING !== "false"
      )
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvd29ya3NwYWNlL3Npc3RlbWFfYW5pbWFpc19hc3NvY2lhY2FvXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvd29ya3NwYWNlL3Npc3RlbWFfYW5pbWFpc19hc3NvY2lhY2FvL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy93b3Jrc3BhY2Uvc2lzdGVtYV9hbmltYWlzX2Fzc29jaWFjYW8vdml0ZS5jb25maWcudHNcIjsvLyB2aXRlLmNvbmZpZy50c1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gJ2xvdmFibGUtdGFnZ2VyJztcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIHJldHVybiB7XG4gICAgc2VydmVyOiB7XG4gICAgICBob3N0OiBcIjo6XCIsXG4gICAgICBwb3J0OiA4MDgwLFxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3QoKSxcbiAgICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiYgY29tcG9uZW50VGFnZ2VyKCksXG4gICAgXS5maWx0ZXIoQm9vbGVhbiksXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICAgIC8vIFByb3h5IHJlYWN0LXJvdXRlci1kb20gdG8gb3VyIHdyYXBwZXJcbiAgICAgICAgXCJyZWFjdC1yb3V0ZXItZG9tXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvbGliL3JlYWN0LXJvdXRlci1kb20tcHJveHkudHN4XCIpLFxuICAgICAgICAvLyBPcmlnaW5hbCByZWFjdC1yb3V0ZXItZG9tIHVuZGVyIGEgZGlmZmVyZW50IG5hbWVcbiAgICAgICAgXCJyZWFjdC1yb3V0ZXItZG9tLW9yaWdpbmFsXCI6IFwicmVhY3Qtcm91dGVyLWRvbVwiLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgLy8gRGVmaW5lIGVudmlyb25tZW50IHZhcmlhYmxlcyBmb3IgYnVpbGQtdGltZSBjb25maWd1cmF0aW9uXG4gICAgICAvLyBJbiBwcm9kdWN0aW9uLCB0aGlzIHdpbGwgYmUgZmFsc2UgYnkgZGVmYXVsdCB1bmxlc3MgZXhwbGljaXRseSBzZXQgdG8gJ3RydWUnXG4gICAgICAvLyBJbiBkZXZlbG9wbWVudCBhbmQgdGVzdCwgdGhpcyB3aWxsIGJlIHRydWUgYnkgZGVmYXVsdFxuICAgICAgX19ST1VURV9NRVNTQUdJTkdfRU5BQkxFRF9fOiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nIFxuICAgICAgICAgID8gcHJvY2Vzcy5lbnYuVklURV9FTkFCTEVfUk9VVEVfTUVTU0FHSU5HID09PSAndHJ1ZSdcbiAgICAgICAgICA6IHByb2Nlc3MuZW52LlZJVEVfRU5BQkxFX1JPVVRFX01FU1NBR0lORyAhPT0gJ2ZhbHNlJ1xuICAgICAgKSxcbiAgICB9LFxuICB9XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsU0FBUyx1QkFBdUI7QUFDaEMsT0FBTyxVQUFVO0FBSmpCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQSxJQUM1QyxFQUFFLE9BQU8sT0FBTztBQUFBLElBQ2hCLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQTtBQUFBLFFBRXBDLG9CQUFvQixLQUFLLFFBQVEsa0NBQVcsc0NBQXNDO0FBQUE7QUFBQSxRQUVsRiw2QkFBNkI7QUFBQSxNQUMvQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlOLDZCQUE2QixLQUFLO0FBQUEsUUFDaEMsU0FBUyxlQUNMLFFBQVEsSUFBSSxnQ0FBZ0MsU0FDNUMsUUFBUSxJQUFJLGdDQUFnQztBQUFBLE1BQ2xEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    define: {
        'process.env': process.env, // Expose process.env to the browser
    },
    envPrefix: 'REACT_APP_', 
});

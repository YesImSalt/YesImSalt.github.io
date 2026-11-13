// Settings for Vite, the tool that turns our React (JSX) code into a normal website.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // teaches Vite how to read JSX

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    // While developing, the website runs on port 5173 and the API on port 3000.
    // This line forwards any request starting with /api to the Express server.
    proxy: { '/api': 'http://localhost:3000' }
  }
});

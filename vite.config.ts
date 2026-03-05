import tailwindcss from '@tailwindcss/vite';
import { creator } from '@lottiefiles/vite-plugin-creator';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [tailwindcss(), react(), mkcert(), creator()],
});

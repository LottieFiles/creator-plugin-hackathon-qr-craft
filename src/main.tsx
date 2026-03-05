import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@lottiefiles/creator-plugins-ui/styles.css';
import './styles/globals.css';

import { App } from './app.tsx';

document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

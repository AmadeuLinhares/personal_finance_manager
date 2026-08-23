import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import { QueryProvider } from './app/providers/QueryProvider';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root is missing from index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
);

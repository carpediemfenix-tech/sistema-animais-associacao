import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Registrar Service Worker para funcionalidades PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrado com sucesso: ', registration);
      })
      .catch((registrationError) => {
        console.log('Falha no registro do SW: ', registrationError);
      });
  });
}

// Detectar se é uma aplicação desktop/PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Executando como aplicação desktop');
  // Adicionar funcionalidades específicas para desktop
  document.body.classList.add('desktop-mode');
}

createRoot(document.getElementById("root")!).render(<App />);

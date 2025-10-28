import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n'

// Initialize cache busting before rendering the app
// Use dynamic import to avoid circular dependency warnings
void import('./utils/cacheBusting').then(({ initializeCacheBusting }) => {
  initializeCacheBusting();
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <App />,
)


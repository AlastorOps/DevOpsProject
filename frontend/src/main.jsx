import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.jsx'
import { ThemeSync } from './hooks/useTheme'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeSync />
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/latin-300.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/inter/latin-800.css'
import '@fontsource/material-symbols-outlined/latin-400.css'
import '@fontsource/noto-sans-khmer/khmer-300.css'
import '@fontsource/noto-sans-khmer/khmer-400.css'
import '@fontsource/noto-sans-khmer/khmer-500.css'
import '@fontsource/noto-sans-khmer/khmer-600.css'
import '@fontsource/noto-sans-khmer/khmer-700.css'
import '@fontsource/battambang/khmer-400.css'
import '@fontsource/battambang/khmer-700.css'
import './index.css'
import App from './app/App.jsx'
import { applyTheme, getStoredTheme } from './hooks/useTheme'

applyTheme(getStoredTheme())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

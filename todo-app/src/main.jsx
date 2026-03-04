import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import './index.css'
import App from './App.jsx'

function Fallback({ error }) {
  return (
    <div role="alert" style={{ padding: '20px', background: '#ffe6e6', color: '#900', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '2em', fontWeight: 'bold' }}>Algo salió mal :(</h1>
      <pre style={{ color: 'red', marginTop: '10px' }}>{error.message}</pre>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={Fallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

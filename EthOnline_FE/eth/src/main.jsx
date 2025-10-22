import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiConfig } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { config } from './wagmiClient.js'
import { PlaygroundProvider } from './contexts/PlaygroundContext.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <PlaygroundProvider>
          <App />
        </PlaygroundProvider>
      </QueryClientProvider>
    </WagmiConfig>
  </StrictMode>,
)

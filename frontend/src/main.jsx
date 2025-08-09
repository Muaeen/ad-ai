import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const hasClerk = Boolean(clerkPubKey)

const root = createRoot(document.getElementById('root'))

if (hasClerk) {
  root.render(
    <StrictMode>
      <ClerkProvider publishableKey={clerkPubKey}>
        <App />
      </ClerkProvider>
    </StrictMode>,
  )
} else {
  // Dev fallback: Render app without Clerk so the public homepage loads
  // Authentication-specific components are gated inside the app
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

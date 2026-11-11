import { App } from '@/components/cymorflix/App'
import { StoreProvider } from '@/lib/store'

export default function Page() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  )
}

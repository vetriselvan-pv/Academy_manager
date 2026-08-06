import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/auth/AuthContext'
import { queryClient } from '@/lib/queryClient'
import { AppRoutes } from '@/routes/AppRoutes'

function App() {
  const routerBaseName = import.meta.env.BASE_URL || '/'

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={routerBaseName}>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default App

'use client'

import { FC, useState, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools} from '@tanstack/react-query-devtools'

interface QueryClientProviderProps {
  children: ReactNode
}

const QueryClientProvider: FC<QueryClientProviderProps> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export default QueryClientProvider
"use client"

import { ClerkProvider, useAuth } from "@clerk/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { trpc } from "@/lib/trpc"
import { httpBatchLink } from "@trpc/client"

function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30 * 1000, retry: 1 },
        },
      })
  )

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/trpc`,
          headers: async () => {
            const token = await getToken()
            return token ? { Authorization: `Bearer ${token}` } : {}
          },
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <TRPCProvider>{children}</TRPCProvider>
    </ClerkProvider>
  )
}

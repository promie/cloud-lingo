import { ReactNode } from 'react'
import type { Metadata } from 'next'
import './globals.css'
import ReactQueryClientProvider from '@/providers/ReactQueryClientProvider'

export const metadata: Metadata = {
  title: 'Cloud Lingo',
  description: 'Translation App',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
      </body>
    </html>
  )
}

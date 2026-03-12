import type { ReactNode } from 'react'
import { Navbar } from './navbar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-border border-t py-6">
        <p className="text-muted-foreground text-center text-xs">
          Built with React, TanStack Router, React Query &amp; Tailwind CSS v4
        </p>
      </footer>
    </div>
  )
}

import { ExternalLink, Github, Package } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const stack = [
  { name: 'React 19', description: 'UI library', variant: 'default' as const },
  { name: 'TypeScript', description: 'Type safety', variant: 'secondary' as const },
  { name: 'Vite', description: 'Build tool', variant: 'secondary' as const },
  { name: 'TanStack Router', description: 'File-based routing', variant: 'default' as const },
  { name: 'TanStack Query', description: 'Async state management', variant: 'default' as const },
  { name: 'Tailwind v4', description: 'Styling', variant: 'secondary' as const },
  { name: 'Bun', description: 'Runtime & test runner', variant: 'outline' as const },
  { name: 'Radix UI', description: 'Accessible primitives', variant: 'outline' as const },
  { name: 'Sonner', description: 'Toast notifications', variant: 'outline' as const },
  { name: 'Lucide React', description: 'Icons', variant: 'outline' as const },
]

const installationSetup = [
  { step: '1', text: 'Clone the repository' },
  { step: '2', text: 'Run bun install' },
  { step: '3', text: 'Copy .env.example → .env and fill in values' },
  { step: '4', text: 'Run bun run dev' },
]

export function AboutPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">About this template</h1>
        <p className="text-muted-foreground mt-2">
          A production-ready React starter with batteries included. Clone, install, and build.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Tech Stack
          </CardTitle>
          <CardDescription>
            Everything pre-configured so you can focus on building your product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {stack.map(({ name, description, variant }) => (
              <div key={name} className="flex flex-col items-start gap-1">
                <Badge variant={variant}>{name}</Badge>
                <span className="text-muted-foreground text-xs">{description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {installationSetup.map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <span className="bg-primary text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {step}
              </span>
              <span className="text-foreground text-sm">{text}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <a
            href="https://tanstack.com/router"
            target="_blank"
            rel="noopener noreferrer"
            className="gap-1.5"
          >
            <ExternalLink className="h-4 w-4" />
            TanStack Docs
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="gap-1.5"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </Button>
      </div>
    </div>
  )
}

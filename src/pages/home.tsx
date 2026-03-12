import { useState } from 'react'
import { toast } from 'sonner'
import { Bell, CheckCircle, Info, Loader2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function HomePage() {
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')

  const validateInput = () => {
    if (!inputValue.trim()) {
      setInputError('This field is required')
    } else {
      setInputError('')
      toast.success('Submitted!', { description: `You entered: "${inputValue}"` })
    }
  }

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Template</Badge>
          <Badge variant="success">Ready to use</Badge>
        </div>
        <h1 className="text-foreground text-4xl font-bold tracking-tight">
          React + TypeScript + Tailwind v4
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg">
          A fully-featured frontend starter. Everything wired up — routing, data fetching, dark
          mode, components, tests, and Docker support.
        </p>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-foreground text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <Button>
            <Loader2 className="animate-spin" />
            Loading
          </Button>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-foreground text-xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>
      </section>

      {/* Spinners */}
      <section className="space-y-4">
        <h2 className="text-foreground text-xl font-semibold">Spinners</h2>
        <div className="flex items-center gap-6">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-foreground text-xl font-semibold">Cards</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Simple card</CardTitle>
              <CardDescription>With header and content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Cards support header, content, and footer sections out of the box.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>With footer</CardTitle>
              <CardDescription>Includes action buttons</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                The footer area is perfect for CTAs or secondary actions.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Action</Button>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
            </CardFooter>
          </Card>
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Custom styles</CardTitle>
              <CardDescription>Extend via className</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Any component accepts a <code className="font-mono text-xs">className</code> prop
                for one-off customisation.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Input */}
      <section className="space-y-4">
        <h2 className="text-foreground text-xl font-semibold">Input</h2>
        <div className="max-w-sm space-y-4">
          <Input
            label="Username"
            placeholder="e.g. johndoe"
            hint="Must be at least 3 characters."
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              if (inputError) setInputError('')
            }}
            error={inputError}
          />
          <Button onClick={validateInput}>Submit</Button>
        </div>
      </section>

      {/* Toasts */}
      <section className="space-y-4">
        <h2 className="text-foreground text-xl font-semibold">Toasts</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => toast('Default toast', { description: 'This is a default message.' })}
          >
            <Bell className="h-4 w-4" />
            Default
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success('Success!', { description: 'Your changes were saved.' })}
          >
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Success
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info('Info', { description: 'Here is some useful info.' })}
          >
            <Info className="h-4 w-4 text-blue-500" />
            Info
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.warning('Warning', { description: 'Please review before proceeding.' })
            }
          >
            <TriangleAlert className="h-4 w-4 text-amber-500" />
            Warning
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error('Error', { description: 'Something went wrong.' })}
          >
            Error
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
                loading: 'Processing...',
                success: 'Done!',
                error: 'Failed.',
              })
            }
          >
            Promise
          </Button>
        </div>
      </section>

      {/* Dialog */}
      <section className="space-y-4">
        <h2 className="text-foreground text-xl font-semibold">Dialog</h2>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove
                  your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={() => toast.error('Account deleted')}>
                    Delete account
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  )
}

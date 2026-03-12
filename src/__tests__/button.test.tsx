import { describe, expect, test, mock } from 'bun:test'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../components/ui/button'

describe('Button', () => {
  test('renders with text content', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  test('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('calls onClick handler when clicked', async () => {
    const onClick = mock(() => {})
    render(<Button onClick={onClick}>Press me</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test('does not call onClick when disabled', async () => {
    const onClick = mock(() => {})
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  test('applies custom className', () => {
    render(<Button className="my-custom-class">Styled</Button>)
    expect(screen.getByRole('button')).toHaveClass('my-custom-class')
  })

  test('renders all variants without error', () => {
    const variants = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const
    for (const variant of variants) {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
      unmount()
    }
  })
})

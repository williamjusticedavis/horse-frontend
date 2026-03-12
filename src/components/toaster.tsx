import { Toaster } from 'sonner'
import { useTheme } from '@/context/theme-context'

export function ToasterWithTheme() {
  const { resolvedTheme } = useTheme()
  return <Toaster theme={resolvedTheme} richColors closeButton position="top-right" />
}

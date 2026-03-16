import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { config } from '@/lib/config'
import type { Horse } from '@/data/horses'

export function HorseImage({
  horse,
  editMode,
  onFileSelect,
  previewUrl,
}: {
  horse: Horse
  editMode: boolean
  onFileSelect?: (file: File) => void
  previewUrl?: string | null
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const displayUrl =
    previewUrl ??
    (horse.imageUrl
      ? horse.imageUrl.startsWith('http')
        ? horse.imageUrl
        : `${config.apiUrl}${horse.imageUrl}`
      : null)

  return (
    <div>
      <div className="bg-muted flex h-64 items-center justify-center overflow-hidden rounded-xl">
        {displayUrl ? (
          <img src={displayUrl} alt={horse.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-8xl">{horse.imageEmoji ?? '🐴'}</span>
        )}
      </div>
      {editMode && (
        <div className="mt-2 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            {displayUrl ? 'החלף תמונה' : 'העלה תמונה'}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFileSelect?.(f)
            }}
          />
          <span className="text-muted-foreground text-xs">JPEG, PNG, WebP, GIF · עד 5MB</span>
        </div>
      )}
    </div>
  )
}

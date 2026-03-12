import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Horse {
  id: number
  name: string
  age: number
  description: string
}

const horses: Horse[] = [
  { id: 1, name: 'ענן', age: 8, description: 'סוס חום עדין, אוהב ילדים ומתאים לרכיבה טיפולית' },
  { id: 2, name: 'ברק', age: 5, description: 'סוס שחור אנרגטי, מצוין לאימוני רכיבה מתקדמים' },
  { id: 3, name: 'כוכב', age: 12, description: 'סייחה לבנה רגועה, מושלמת למתחילים' },
  { id: 4, name: 'סופה', age: 7, description: 'סוסה חומה, בעלת אופי חזק ונוכחות מרשימה' },
  { id: 5, name: 'גל', age: 10, description: 'סוס אפור ותיק, מלווה ילדים בטיפול רגשי' },
  { id: 6, name: 'אש', age: 6, description: 'סוס אדמדם שובב, מחובר לאנשים' },
]

export function HorsesPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-foreground text-3xl font-bold">הסוסים שלנו</h1>
        <p className="text-muted-foreground mt-2">הכירו את חברי הלהקה שלנו</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {horses.map((horse) => (
          <Card key={horse.id} className="overflow-hidden">
            <div className="bg-muted flex h-48 items-center justify-center">
              <span className="text-6xl">🐴</span>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{horse.name}</CardTitle>
              <p className="text-muted-foreground text-sm">גיל: {horse.age}</p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{horse.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

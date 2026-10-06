import { EclipseIcon, Zap, Layers, ListChecks, SlidersHorizontal, FileOutput } from 'lucide-react'
import { ReactNode } from 'react'

import { Item, ItemDescription, ItemIcon, ItemTitle } from '@/components/ui/item'
import { Section } from '@/components/ui/section'

interface ItemProps {
  title: string
  description: string
  icon: ReactNode
}

interface ItemsProps {
  title?: string
  items?: ItemProps[] | false
  className?: string
}

export default function Items({
  title = 'Все необхідне для щоденної продуктивності',
  items = [
    {
      title: 'Потужний інтерфейс без зайвого',
      description:
        'Різні макети (картки, список, таблиця), гнучке сортування, налаштовуваний сайдбар та фільтри. Усі дії доступні в один клік.',
      icon: <Zap className="size-5 stroke-1" />,
    },
    {
      title: 'Деревоподібні вкладені теги',
      description:
        'Створюйте ієрархії тегів будь-якої глибини, призначайте власні кольори та закріплюйте найважливіші для швидкого доступу.',
      icon: <Layers className="size-5 stroke-1" />,
    },
    {
      title: 'Автоматичні метадані',
      description:
        'Stashly самостійно завантажує заголовок, опис та прев’ю сторінки, щоб ваші закладки виглядали наочно та інформативно.',
      icon: <ListChecks className="size-5 stroke-1" />,
    },
    {
      title: 'Масові дії',
      description:
        'Вибирайте кілька закладок для масового призначення тегів, оновлення метаданих або видалення в один клік.',
      icon: <SlidersHorizontal className="size-5 stroke-1" />,
    },
    {
      title: 'Світла та темна теми',
      description:
        'Фірмова темна тема в стилі DeepSeek для комфортної роботи в будь-який час доби.',
      icon: <EclipseIcon className="size-5 stroke-1" />,
    },
    {
      title: 'Експорт у будь-який час',
      description:
        'Експортуйте всю бібліотеку закладок у стандартний формат HTML або JSON без жодних обмежень.',
      icon: <FileOutput className="size-5 stroke-1" />,
    },
  ],
  className,
}: ItemsProps) {
  return (
    <Section className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-12 sm:gap-20">
        <h2 className="text-center text-3xl font-semibold sm:text-5xl">{title}</h2>
        {items !== false && items.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
            {items.map((item, index) => (
              <Item
                key={index}
                className="border-border/10 gap-6 sm:border-l sm:px-8 sm:py-2 lg:px-10"
              >
                <ItemIcon className="text-muted-foreground">{item.icon}</ItemIcon>
                <div className="flex flex-col gap-3">
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDescription>{item.description}</ItemDescription>
                </div>
              </Item>
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}

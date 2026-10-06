import { ReactNode } from 'react'

import Glow from '@/components/ui/glow'
import { Section } from '@/components/ui/section'
import {
  cardStyle,
  TagsVisual,
  CaptureVisual,
  CodeVisual,
  DuplicatesVisual,
  PhoneVisual,
  SearchVisual,
  ImportVisual,
  TypesVisual,
  ExtractVisual,
} from './features-visuals'

interface AppFeaturesProps {
  /** Brand glow behind the header. */
  showGlow?: boolean
  /** Card visuals (tags, orbit, code, metadata, phone, search, import). */
  showMockups?: boolean
  className?: string
}

function FeatureCard({
  title,
  description,
  className,
  children,
}: {
  title: string
  description: string
  className?: string
  children?: ReactNode
}) {
  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-[16px] border ${className ?? ''}`}
      style={cardStyle}
    >
      <div className="px-[30px] pt-[30px]">
        <h3 className="text-foreground text-[22px] font-semibold tracking-[-0.01em]">{title}</h3>
        <p className="text-muted-foreground mt-3 max-w-[42ch] text-[15px] leading-[1.55]">
          {description}
        </p>
      </div>
      {children}
    </article>
  )
}

export default function AppFeatures({
  showGlow = false,
  showMockups = true,
  className,
}: AppFeaturesProps) {
  return (
    <Section className={className} id="features">
      <div className="max-w-container relative mx-auto w-full">
        {showGlow && (
          <div className="pointer-events-none absolute top-[-90px] left-1/2 h-[300px] w-[680px] -translate-x-1/2 opacity-40">
            <Glow variant="center" />
          </div>
        )}

        <header className="relative mx-auto mb-12 flex flex-col items-center gap-4 text-center sm:mb-20">
          <h2 className="text-3xl font-semibold sm:text-5xl">Бібліотека, яка зберігає порядок</h2>
          <p className="text-muted-foreground text-md max-w-[640px] text-balance sm:text-xl">
            Зберігайте посилання, групуйте за допомогою вкладених тегів та знаходьте потрібне за лічені секунди.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <FeatureCard
            title="Потужні макети та налаштування"
            description="Перемикайтеся між списком, плиткою та таблицею, налаштовуйте відображення полів та сортуйте за будь-якими критеріями."
            className="lg:col-span-4"
          >
            {showMockups && <TypesVisual />}
          </FeatureCard>
          <FeatureCard
            title="Автоматичні метадані"
            description="Stashly самостійно завантажує заголовок, опис та якісне прев'ю-зображення сторінки."
            className="lg:col-span-2"
          >
            {showMockups && <ExtractVisual />}
          </FeatureCard>

          <FeatureCard
            title="Швидке збереження"
            description="Зберігайте веб-сторінки в один клік зі зручним заповненням та автодоповненням тегів."
            className="lg:col-span-2"
          >
            {showMockups && <CaptureVisual />}
          </FeatureCard>

          <FeatureCard
            title="Виявлення дублікатів"
            description="Stashly автоматично розпізнає однакові посилання або спільні домени під час збереження."
            className="lg:col-span-2"
          >
            {showMockups && <DuplicatesVisual />}
          </FeatureCard>

          <FeatureCard
            title="Деревоподібні теги"
            description="Структуруйте закладки за допомогою вкладених тегів, призначайте власні кольори та закріплюйте важливі."
            className="lg:col-span-2"
          >
            {showMockups && <TagsVisual />}
          </FeatureCard>

          <FeatureCard
            title="Повнотекстовий пошук"
            description="Миттєво знаходьте потрібні закладки за назвою, описом, доменом або тегом."
            className="lg:col-span-3"
          >
            {showMockups && <SearchVisual />}
          </FeatureCard>

          <FeatureCard
            title="Працює на будь-якому пристрої"
            description="Повна адаптивність на смартфонах, планшетах і десктопах з підтримкою темної теми."
            className="lg:col-span-3"
          >
            {showMockups && <PhoneVisual />}
          </FeatureCard>

          <FeatureCard
            title="Імпорт та експорт"
            description="Легко перенесіть закладки з Chrome, Safari, Firefox, Edge, Raindrop.io чи Pocket у стандартному форматі."
            className="lg:col-span-3"
          >
            {showMockups && <ImportVisual />}
          </FeatureCard>

          <FeatureCard
            title="Відкритий код та безпека"
            description="Stashly має відкритий вихідний код, безпечно зберігає ваші дані та легко запускається локально."
            className="lg:col-span-3"
          >
            {showMockups && <CodeVisual />}
          </FeatureCard>
        </div>
      </div>
    </Section>
  )
}

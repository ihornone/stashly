import { ReactNode } from 'react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Section } from '@/components/ui/section'

interface FAQItemProps {
  question: string
  answer: ReactNode
  value?: string
}

interface FAQProps {
  title?: string
  description?: string
  items?: FAQItemProps[] | false
  className?: string
}

function Answer({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground mb-4 text-balance">{children}</p>
}

const DEFAULT_ITEMS: FAQItemProps[] = [
  {
    question: 'Як працює організація закладок у Stashly?',
    answer: (
      <>
        <Answer>
          Stashly дозволяє зберігати будь-які веб-посилання та структурувати їх за допомогою деревоподібних тегів будь-якого рівня вкладеності. Ви можете призначати тегам кольори, закріплювати важливі теги та швидко фільтрувати свій каталог.
        </Answer>
      </>
    ),
  },
  {
    question: 'Чи автоматично підтягуються зображення та опис сторінок?',
    answer: (
      <>
        <Answer>
          Так! При введенні або вставці посилання Stashly автоматично завантажує заголовок сторінки, її опис та головне прев'ю-зображення (OG Image / Favicon).
        </Answer>
      </>
    ),
  },
  {
    question: 'Як імпортувати закладки з браузера або Pocket/Raindrop?',
    answer: (
      <>
        <Answer>
          Ви можете експортувати HTML-файл закладок із будь-якого популярного браузера (Chrome, Firefox, Safari, Brave) або сервісів Raindrop.io та Pocket, а потім завантажити його у Stashly в один клік.
        </Answer>
      </>
    ),
  },
  {
    question: 'Як працює виявлення дублікатів?',
    answer: (
      <>
        <Answer>
          При додаванні нового посилання Stashly миттєво перевіряє вашу базу даних і попереджає, якщо схоже посилання або домен вже збережено у вашій колекції, що допомагає уникати повторів.
        </Answer>
      </>
    ),
  },
  {
    question: 'Чи безпечні мої дані?',
    answer: (
      <>
        <Answer>
          Ваші закладки зберігаються в надійній базі даних SQLite, а вся передача даних захищена. Ваша приватність та контроль над вашими даними є нашим головним пріоритетом.
        </Answer>
      </>
    ),
  },
  {
    question: 'Чи можу я встановити та запустити Stashly локально?',
    answer: (
      <>
        <Answer>
          Так, Stashly має відкритий вихідний код і легко розгортається на власному сервері або локально.
        </Answer>
      </>
    ),
  },
]

export default function FAQ({
  title = 'Часті запитання',
  description = 'Все, що потрібно знати про роботу із закладками, організацію та можливості Stashly.',
  items = DEFAULT_ITEMS,
  className,
}: FAQProps) {
  return (
    <Section className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-12 sm:gap-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-semibold sm:text-5xl">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-md max-w-[640px] text-balance sm:text-xl">
              {description}
            </p>
          )}
        </div>
        {items !== false && items.length > 0 && (
          <Accordion type="single" collapsible className="w-full max-w-[800px]">
            {items.map((item, index) => (
              <AccordionItem
                key={item.value ?? item.question}
                value={item.value || `item-${index + 1}`}
              >
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </Section>
  )
}

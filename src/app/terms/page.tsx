import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar, Footer } from '@/features/landing';
import { Scale, CheckCircle2, AlertCircle, FileText, ArrowLeft, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Умови використання — Stashly',
  description: 'Умови використання сервісу Stashly: правила користування, права та обов’язки сторін.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <ArrowLeft className="size-3.5" />
            <span>Головна</span>
          </Link>
          <span>/</span>
          <span className="text-foreground">Умови використання</span>
        </div>

        {/* Page Header */}
        <header className="border-b border-border/60 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <Scale className="size-3.5" />
            <span>Угода користувача</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Умови використання
          </h1>
          <p className="text-sm text-muted-foreground">
            Останнє оновлення: 3 жовтня 2026 року
          </p>
        </header>

        {/* Key Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl border border-border/60 bg-card/50 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <CheckCircle2 className="size-4" />
              <span>Прозорість</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Чіткі та зрозумілі правила використання сервісу без прихованих платежів чи умов.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border/60 bg-card/50 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Shield className="size-4" />
              <span>Ваш контент</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ви зберігаєте всі авторські права на ваші закладки, нотатки та створені структури.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border/60 bg-card/50 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <AlertCircle className="size-4" />
              <span>Безпечне середовище</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Заборона протиправного контенту, шкідливого ПЗ та спам-розсилок.
            </p>
          </div>
        </div>

        {/* Main Content Body */}
        <article className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
          
          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              1. Прийняття умов
            </h2>
            <p>
              Використовуючи сервіс <strong>Stashly</strong> (включаючи веб-додаток, API, PWA та пов'язані сервіси), ви погоджуєтеся дотримуватися цих Умов використання та нашої Політики конфіденційності. Якщо ви не погоджуєтеся з будь-яким пунктом, будь ласка, припиніть користування сервісом.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              2. Обліковий запис та безпека
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Ви несете відповідальність за збереження конфіденційності ваших облікових даних для входу.</li>
              <li>Ви зобов'язуєтеся негайно повідомити нас про будь-яке несанкціоноване використання вашого облікового запису або інші порушення безпеки.</li>
              <li>Сервіс призначений для особистого або внутрішнього професійного використання.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              3. Правила прийнятного використання
            </h2>
            <p>При використанні Stashly забороняється:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Зберігати, поширювати або публікувати посилання на протиправний, шкідливий, загрозливий або образливий контент.</li>
              <li>Використовувати сервіс для розповсюдження шкідливого програмного забезпечення (вірусів, троянів, фішингу).</li>
              <li>Здійснювати спроби несанкціонованого доступу до систем, баз даних або акаунтів інших користувачів.</li>
              <li>Створювати надмірне штучне навантаження на інфраструктуру сервісу шляхом автоматизованих спам-запитів.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              4. Права власності на контент
            </h2>
            <p>
              <strong>Ваш контент залишається вашим:</strong> Ми не претендуємо на жодні права власності щодо збережених вами посилань, описів, тегів чи нотаток.
            </p>
            <p>
              Відкритий вихідний код проєкту ліцензується згідно з відкритою ліцензією, що дозволяє користувачам перевіряти, розгортати та адаптувати програмне забезпечення на власних серверах.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              5. Доступність сервісу та гарантії
            </h2>
            <p>
              Сервіс надається за принципом <strong>«як є» (as is)</strong> та <strong>«як доступно» (as available)</strong>. Ми докладаємо максимальних зусиль для забезпечення стабільної та безперебійної роботи, але не гарантуємо абсолютної відсутності технічних збоїв або тимчасових перерв у доступі під час оновлень.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              6. Обмеження відповідальності
            </h2>
            <p>
              Stashly не несе відповідальності за зміст зовнішніх веб-сайтів, посилання на які зберігаються або публікуються користувачами, а також за будь-які непрямі збитки чи втрату даних, що виникли внаслідок використання або неможливості використання сервісу.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              7. Зміни до Умов використання
            </h2>
            <p>
              Ми залишаємо за собою право оновлювати ці Умови в будь-який час. Продовжуючи користуватися сервісом після внесення змін, ви підтверджуєте свою згоду з оновленими Умовами.
            </p>
          </section>

          <section className="space-y-3 border-t border-border/60 pt-6">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              8. Зворотний зв'язок
            </h2>
            <p>
              З будь-якими запитаннями щодо цих Умов звертайтеся до нашої спільноти або відкривайте звернення у репозиторії на GitHub.
            </p>
          </section>

        </article>
      </main>

      <Footer />
    </div>
  );
}

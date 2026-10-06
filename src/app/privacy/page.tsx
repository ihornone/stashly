import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar, Footer } from '@/features/landing';
import { ShieldCheck, Lock, Database, EyeOff, FileText, ArrowLeft, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Політика конфіденційності — Stashly',
  description: 'Політика конфіденційності Stashly: як ми захищаємо ваші персональні дані та зберігаємо повну приватність закладок.',
};

export default function PrivacyPage() {
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
          <span className="text-foreground">Політика конфіденційності</span>
        </div>

        {/* Page Header */}
        <header className="border-b border-border/60 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="size-3.5" />
            <span>Захист та приватність даних</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Політика конфіденційності
          </h1>
          <p className="text-sm text-muted-foreground">
            Останнє оновлення: 3 жовтня 2026 року
          </p>
        </header>

        {/* Key Principles Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl border border-border/60 bg-card/50 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <EyeOff className="size-4" />
              <span>Без стеження</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ми не збираємо вашу історію веб-серфінгу і не продаємо персональну інформацію рекламодавцям.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border/60 bg-card/50 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Lock className="size-4" />
              <span>Шифрування</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Усі з'єднання та обмін даними захищені сучасними протоколами HTTPS / TLS.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border/60 bg-card/50 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Database className="size-4" />
              <span>Ваші дані</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Повний експорт бази в HTML, JSON або CSV та безповоротне видалення за вашим бажанням.
            </p>
          </div>
        </div>

        {/* Main Content Body */}
        <article className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
          
          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              1. Загальні положення
            </h2>
            <p>
              Ця Політика конфіденційності пояснює, як <strong>Stashly</strong> («ми», «наш сервіс») збирає, використовує, зберігає та захищає вашу інформацію при користуванні веб-сайтом, веб-додатком та функціями PWA.
            </p>
            <p>
              Ми прагнемо створити максимально безпечне середовище, де користувач має повний контроль над своєю інформацією.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              2. Які дані ми збираємо
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-foreground">Дані облікового запису:</strong> адреса електронної пошти та базові дані профілю (ім'я, аватар), які ви надаєте під час реєстрації або авторизації.
              </li>
              <li>
                <strong className="text-foreground">Закладки та структурований вміст:</strong> збережені вами посилання (URL), власні заголовки, опис, примітки, теги та параметри відображення.
              </li>
              <li>
                <strong className="text-foreground">Технічні метадані сторінок:</strong> для зручного відображення сервіс автоматично отримує публічні мета-теги доданого сайту (Open Graph заголовок, опис, Favicon та прев'ю-зображення).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              3. Як ми використовуємо інформацію
            </h2>
            <p>Зібрані дані використовуються виключно для:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Забезпечення роботи функціоналу сервісу (організація, пошук, фільтрація та сортування закладок).</li>
              <li>Синхронізації ваших даних між пристроями та браузерами.</li>
              <li>Формування публічних посилань на колекції за вашим явним запитом (функція «Поділитися категорією»).</li>
              <li>Забезпечення технічної підтримки та безпеки платформи.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              4. Спільний доступ та публічні колекції
            </h2>
            <p>
              За замовчуванням усі ваші закладки та категорії є <strong>абсолютно приватними</strong> і доступні лише вам після авторизації.
            </p>
            <p>
              Якщо ви самостійно вмикаєте спільний доступ для певної категорії (тегу), сервіс генерує унікальне публічне посилання. Будь-який користувач, який має це посилання, зможе переглядати закладки з цієї категорії або імпортувати їх до своєї колекції. Ви можете вимкнути публічний доступ до категорії в будь-який момент.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              5. Зберігання, експорт та видалення даних
            </h2>
            <p>
              Ви маєте повне право на володіння своїми даними:
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>Експорт:</strong> Ви можете у будь-яку мить завантажити повну копію своїх закладок у форматах HTML, JSON або CSV через меню налаштувань.</li>
              <li><strong>Видалення:</strong> Ви можете видаляти окремі закладки, теги або повністю очистити свій акаунт. При видаленні дані безповоротно стираються з основної бази даних.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              6. Файли Cookie та локальне сховище
            </h2>
            <p>
              Stashly використовує файли cookie та локальне сховище браузера (LocalStorage / IndexedDB) виключно для збереження вашої поточної сесії авторизації, вибраної теми інтерфейсу (світла / темна / системна) та параметрів відображення.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              7. Зміни до Політики конфіденційності
            </h2>
            <p>
              Ми можемо періодично оновлювати цю Політику для відображення змін у функціоналі чи законодавстві. Актуальна версія завжди розміщується на цій сторінці із зазначенням дати останнього оновлення.
            </p>
          </section>

          <section className="space-y-3 border-t border-border/60 pt-6">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              8. Контакти
            </h2>
            <p>
              Якщо у вас виникли запитання, зауваження чи запити щодо ваших персональних даних, зв'яжіться з нами через сторінку підтримки або репозиторій проєкту на GitHub.
            </p>
          </section>

        </article>
      </main>

      <Footer />
    </div>
  );
}

import React from 'react';
import {
  Sparkles,
  Tag,
  Globe,
  Smartphone,
  Layers,
  CheckSquare,
  LayoutGrid,
  List,
  Table,
  Settings,
  MoreVertical,
  FileCode2,
  FileJson,
  FileSpreadsheet,
  Terminal,
  KeyRound,
  AlertCircle,
  BookOpen,
  Send,
  Hash,
} from 'lucide-react';
import { PwaPlatformTabs } from './PwaPlatformTabs';
import { BookmarkletBox } from './BookmarkletBox';

const codeBlockClass =
  'p-3 bg-muted/40 border border-border/40 rounded-xl font-mono text-xs text-foreground overflow-x-auto whitespace-pre';

export interface DocItem {
  slug: string;
  category: string;
  title: string;
  description: string;
  lastUpdated: string;
  order: number;
  toc: { value: string; url: string; depth: number }[];
  content: React.ReactNode;
}

export const allDocs: DocItem[] = [
  // 1. Вступ
  {
    slug: 'getting-started/introduction',
    category: 'getting-started',
    title: 'Вступ до Stashly',
    description: 'Познайомтеся зі Stashly — сучасним, приватним менеджером закладок зі смарт-полями та підтримкою PWA.',
    lastUpdated: '3 жовтня 2026',
    order: 1,
    toc: [
      { value: 'Що таке Stashly?', url: '#what-is-stashly', depth: 2 },
      { value: 'Головні переваги', url: '#key-features', depth: 2 },
      { value: 'Для кого створено сервіс?', url: '#who-is-stashly-for', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <h2 id="what-is-stashly" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Що таке Stashly?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Stashly</strong> — це швидкий, автономний та елегантний менеджер закладок, розроблений для тих, хто втомився від хаосу у браузерних панелях і хоче надійно структурувати корисний контент з інтернету.
        </p>

        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3 my-4">
          <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground block mb-1">Повна незалежність ваших даних</strong>
            Сервіс працює на вашому власному сервері або у Cloudflare Edge. Всі ваші посилання, нотатки та колекції належать лише вам без стороннього стеження та реклами.
          </div>
        </div>

        <h2 id="key-features" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Головні переваги
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-4">
          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground mb-1">
              <Tag className="size-4 text-primary" />
              Ієрархічні теги
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Створюйте необмежену глибину категорій через слеш (<code className="text-primary bg-primary/10 px-1 py-0.5 rounded">робота/проєкт/дизайн</code>) з колірним кодуванням та закріпленням.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground mb-1">
              <Globe className="size-4 text-primary" />
              Публічні колекції
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Діліться вибраними категоріями в один клік. Отримувачі можуть інтелектуально імпортувати або об'єднати оновлення.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground mb-1">
              <Smartphone className="size-4 text-primary" />
              PWA та Web Share Target
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Встановлюйте додаток на iPhone, Android та ПК. Надсилайте посилання прямо з кнопки «Поділитися» вашого телефону.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground mb-1">
              <Layers className="size-4 text-primary" />
              3 режими перегляду
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Перемикайтеся між візуальними картками, компактним списком для швидкого сканування або таблицею з сортуванням.
            </p>
          </div>
        </div>

        <h2 id="who-is-stashly-for" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Для кого створено сервіс?
        </h2>
        <ul className="space-y-2 text-muted-foreground text-sm list-disc list-inside">
          <li><strong className="text-foreground">Розробники та IT-спеціалісти:</strong> Зберігайте документацію, GitHub репозиторії, сніпети та туторіали.</li>
          <li><strong className="text-foreground">Дослідники та студенти:</strong> Організовуйте джерела до наукових робіт, статей та матеріалів за вкладеними тегами.</li>
          <li><strong className="text-foreground">Поціновувачі приватності:</strong> Впевненість у збереженні важливої інформації без прив'язки до закритих корпоративних платформ.</li>
        </ul>
      </div>
    ),
  },

  // 2. Швидкий старт
  {
    slug: 'getting-started/quickstart',
    category: 'getting-started',
    title: 'Швидкий старт',
    description: 'Як зберегти першу закладку, налаштувати гарячі клавіші та використовувати букмарклет.',
    lastUpdated: '3 жовтня 2026',
    order: 2,
    toc: [
      { value: 'Створення першої закладки', url: '#create-bookmark', depth: 2 },
      { value: 'Букмарклет для збереження в 1 клік', url: '#bookmarklet', depth: 2 },
      { value: 'Гарячі клавіші', url: '#shortcuts', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <h2 id="create-bookmark" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Створення першої закладки
        </h2>
        <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-sm">
          <li>
            Натисніть кнопку <strong className="text-foreground">+ Додати</strong> на верхній панелі або просто натисніть клавішу <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded-md text-foreground">N</kbd> на клавіатурі.
          </li>
          <li>
            Вставте URL-адресу посилання.
          </li>
          <li>
            Stashly автоматично завантажить заголовок сторінки, короткий опис та прев'ю-зображення.
          </li>
          <li>
            Вкажіть потрібний тег (або створіть новий просто в полі вводу) і натисніть <strong className="text-foreground">Зберегти</strong>.
          </li>
        </ol>

        <h2 id="bookmarklet" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Букмарклет для збереження в 1 клік
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Букмарклет — це спеціальна закладка у вашому браузері, натискання якої миттєво відкриває спливаюче вікно для збереження поточної вкладки у Stashly:
        </p>

        <BookmarkletBox />

        <h2 id="shortcuts" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Гарячі клавіші для швидкої роботи
        </h2>
        <div className="border border-border/60 rounded-xl overflow-hidden text-sm">
          <div className="grid grid-cols-2 p-3 bg-muted/30 font-semibold text-xs border-b border-border/60">
            <span>Дія</span>
            <span>Клавіша</span>
          </div>
          <div className="grid grid-cols-2 p-3 border-b border-border/40 items-center">
            <span className="text-muted-foreground">Створити нову закладку</span>
            <div><kbd className="px-2 py-0.5 text-xs font-mono bg-muted border border-border rounded text-foreground">N</kbd></div>
          </div>
          <div className="grid grid-cols-2 p-3 border-b border-border/40 items-center">
            <span className="text-muted-foreground">Швидкий пошук / Фільтр</span>
            <div><kbd className="px-2 py-0.5 text-xs font-mono bg-muted border border-border rounded text-foreground">/</kbd></div>
          </div>
          <div className="grid grid-cols-2 p-3 items-center">
            <span className="text-muted-foreground">Закрити діалог / Скасувати</span>
            <div><kbd className="px-2 py-0.5 text-xs font-mono bg-muted border border-border rounded text-foreground">Esc</kbd></div>
          </div>
        </div>
      </div>
    ),
  },

  // 3. Встановлення як PWA
  {
    slug: 'getting-started/installing-as-a-pwa-app',
    category: 'getting-started',
    title: 'Встановлення як додаток (PWA)',
    description: 'Як встановити Stashly на iPhone, Android та комп’ютер для швидкого доступу та шерингу.',
    lastUpdated: '3 жовтня 2026',
    order: 3,
    toc: [
      { value: 'Вибір пристрою', url: '#platform-select', depth: 2 },
      { value: 'iPhone та iPad (iOS Safari)', url: '#ios', depth: 2 },
      { value: 'Android (Google Chrome)', url: '#android', depth: 2 },
      { value: 'Комп’ютер (Desktop)', url: '#desktop', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Stashly підтримує стандарт <strong>Progressive Web App (PWA)</strong>. Додаток працює на весь екран без панелей браузера і підтримує системну інтеграцію для прийому посилань (Web Share Target).
        </p>

        <h2 id="platform-select" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Оберіть вашу платформу:
        </h2>

        <PwaPlatformTabs />
      </div>
    ),
  },

  // 4. Додавання та редагування закладок
  {
    slug: 'guides/adding-and-editing-bookmarks',
    category: 'guides',
    title: 'Додавання та редагування закладок',
    description: 'Автоматичне вилучення метаданих, примітки, оновлення прев’ю та контроль дублікатів.',
    lastUpdated: '3 жовтня 2026',
    order: 4,
    toc: [
      { value: 'Автоматичний парсинг сторінок', url: '#metadata-scraping', depth: 2 },
      { value: 'Редагування та примітки', url: '#editing-notes', depth: 2 },
      { value: 'Запобігання дублюванню', url: '#duplicates', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <h2 id="metadata-scraping" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Автоматичний парсинг сторінок
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Коли ви додаєте посилання, серверний рушій Stashly самостійно:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
          <li>Визначає точний заголовок сторінки (Open Graph / Title).</li>
          <li>Отримує короткий опис статті або ресурсу.</li>
          <li>Завантажує найкраще прев'ю-зображення (OG Image / Twitter Card).</li>
          <li>Знаходить та зберігає іконку сайту (Favicon).</li>
        </ul>

        <h2 id="editing-notes" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Редагування та персональні примітки
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Ви можете в будь-який момент відкрити закладку для зміни інформації. Додавайте власні примітки, змінюйте назву чи призначайте нові теги. Кнопка <strong>«Оновити метадані»</strong> дозволяє заново пересканувати сторінку, якщо її вміст змінився.
        </p>

        <h2 id="duplicates" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Запобігання дублюванню
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Якщо ви спробуєте зберегти URL, який уже є у вашій базі, Stashly попередить про це та покаже існуючий запис, щоб уникнути засмічення колекції.
        </p>
      </div>
    ),
  },

  // 5. Організація за допомогою тегів
  {
    slug: 'guides/organizing-with-tags',
    category: 'guides',
    title: 'Організація за допомогою тегів',
    description: 'Ієрархічні вкладені теги, палітра кольорів, закріплення важливих категорій та лічильники.',
    lastUpdated: '3 жовтня 2026',
    order: 5,
    toc: [
      { value: 'Вкладені теги (Ієрархія)', url: '#nested-tags', depth: 2 },
      { value: 'Кольори та закріплення', url: '#colors-pinning', depth: 2 },
      { value: 'Налаштування агрегації', url: '#aggregation', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <h2 id="nested-tags" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Вкладені теги (Ієрархія через слеш)
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Забудьте про складні діалоги створення папок. Просто розділіть назви знаком слеша <code className="text-primary bg-primary/10 px-1 py-0.5 rounded font-mono">/</code>:
        </p>
        <div className="p-3 bg-muted/40 border border-border/40 rounded-xl font-mono text-xs text-foreground">
          Розробка / React / UI-бібліотеки
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Stashly автоматично створить деревоподібну структуру в бічній панелі зі зручним розгортанням та згортанням гілок.
        </p>

        <h2 id="colors-pinning" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Колірне маркування та закріплення
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Натисніть на меню тегу <MoreVertical className="inline size-3.5 mx-0.5 text-muted-foreground align-middle" /> у бічній панелі, щоб:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
          <li><strong>Обрати колір:</strong> 8 приємних відтінків (блакитний, зелений, фіолетовий, тощо) для швидкого зорового розрізнення.</li>
          <li><strong>Закріпити тег:</strong> Закріплені категорії завжди залишаються у верхньому блоці меню.</li>
        </ul>

        <h2 id="aggregation" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Налаштування агрегації вкладених закладок
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          У меню <em>«Налаштування → Персоналізація»</em> ви можете увімкнути опцію <strong>«Включати елементи вкладених тегів»</strong>. При виборі батьківської категорії (наприклад, <em>«Розробка»</em>) ви побачите всі закладки з її підкатегорій (<em>«React»</em>, <em>«UI-бібліотеки»</em>) разом.
        </p>
      </div>
    ),
  },

  // 6. Спільний доступ та шеринг
  {
    slug: 'guides/sharing-and-public-access',
    category: 'guides',
    title: 'Спільний доступ та шеринг',
    description: 'Публікація категорій за посиланням, позначки публічності та розумний імпорт оновлень.',
    lastUpdated: '3 жовтня 2026',
    order: 6,
    toc: [
      { value: 'Публікація категорії посиланням', url: '#share-category', depth: 2 },
      { value: 'Позначка публічного доступу (Глобус)', url: '#globe-badge', depth: 2 },
      { value: 'Розумний імпорт та об’єднання', url: '#smart-import', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <h2 id="share-category" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Публікація категорії посиланням
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Хочете поділитися добіркою корисних сервісів з колегою або аудиторією? Натисніть меню тегу <MoreVertical className="inline size-3.5 mx-0.5 text-muted-foreground align-middle" /> → <strong className="text-foreground">«Поділитися»</strong>. Stashly згенерує красиву публічну сторінку за адресою <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">/share/[id]</code>, яка доступна без авторизації.
        </p>

        <h2 id="globe-badge" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4 flex items-center gap-2">
          <span>Позначка публічного доступу</span>
          <Globe className="size-5 text-blue-500" />
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Усі опубліковані категорії автоматично позначаються іконкою глобуса в бічній панелі та на бейджах карток. Ви завжди бачите, які з ваших колекцій відкриті для перегляду іншими.
        </p>

        <h2 id="smart-import" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Розумний імпорт та об’єднання
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Коли користувач відкриває вашу спільну категорію:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>
            <strong>Якщо всі закладки вже є в його базі:</strong> Stashly повідомить <em>«Вже додано (100% збіг)»</em> і одразу відкриє існуючий тег без зайвого клонування.
          </li>
          <li>
            <strong>Якщо автор додав нові закладки:</strong> З'являється вибір:
            <ul className="list-disc list-inside pl-5 mt-1 space-y-1 text-xs">
              <li><strong className="text-foreground">«Об'єднати з існуючою (+N нових)»:</strong> додати лише ті посилання, яких ще немає.</li>
              <li><strong className="text-foreground">«Створити як нову»:</strong> імпортувати окремою незалежною категорією.</li>
            </ul>
          </li>
        </ul>
      </div>
    ),
  },

  // 7. Пошук, фільтри та режими перегляду
  {
    slug: 'guides/finding-and-viewing-bookmarks',
    category: 'guides',
    title: 'Пошук, фільтри та режими перегляду',
    description: 'Миттєвий пошук без затримок, сортування та перемикання між Сіткою, Списком і Таблицею.',
    lastUpdated: '3 жовтня 2026',
    order: 7,
    toc: [
      { value: 'Миттєвий пошук', url: '#instant-search', depth: 2 },
      { value: 'Режими перегляду', url: '#view-modes', depth: 2 },
      { value: 'Сортування та фільтри', url: '#sorting-filters', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <h2 id="instant-search" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Миттєвий пошук
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Пошук працює в реальному часі під час введення тексту. Він одночасно перевіряє заголовки сторінок, повні URL-адреси, збережені описи та назви тегів.
        </p>

        <h2 id="view-modes" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          3 режими перегляду
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground mb-1">
              <LayoutGrid className="size-4 text-blue-500" />
              Сітка карток
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Зручно для статей, відео та візуального контенту з великими прев'ю-зображеннями.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground mb-1">
              <List className="size-4 text-amber-500" />
              Компактний список
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Найвища інформаційна щільність — ідеально для швидкого перегляду сотень посилань.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground mb-1">
              <Table className="size-4 text-emerald-500" />
              Таблиця
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Зручний режим для сортування за колонками, датою створення або статусом перевірки.
            </p>
          </div>
        </div>

        <h2 id="sorting-filters" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Сортування та фільтри
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Сортуйте матеріали за новизною (спочатку нові або старі), за алфавітом, або фільтруйте нерозібрані закладки (без тегів) через розділ <strong>«Без тегів»</strong> у бічному меню.
        </p>
      </div>
    ),
  },

  // 8. Імпорт та Експорт
  {
    slug: 'guides/importing-bookmarks',
    category: 'guides',
    title: 'Імпорт та Експорт бази',
    description: 'Перенесення закладок з Google Chrome, Firefox, Safari, Edge, Pocket та Raindrop.io.',
    lastUpdated: '3 жовтня 2026',
    order: 8,
    toc: [
      { value: 'Підтримувані формати імпорту', url: '#supported-formats', depth: 2 },
      { value: 'Як виконати імпорт', url: '#how-to-import', depth: 2 },
      { value: 'Експорт резервної копії', url: '#export-backup', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <h2 id="supported-formats" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Підтримувані формати імпорту
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-blue-500 mb-1">
              <FileCode2 className="size-4" />
              HTML файл
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Стандартний формат експорту будь-якого браузера (Chrome, Firefox, Safari, Edge, Brave, Opera).
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-amber-500 mb-1">
              <FileJson className="size-4" />
              JSON Backup
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Повна структурована резервна копія з метаданими та зв'язками тегів.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-emerald-500 mb-1">
              <FileSpreadsheet className="size-4" />
              CSV таблиця
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Експорт списків із Pocket, Raindrop.io або власних електронних таблиць.
            </p>
          </div>
        </div>

        <h2 id="how-to-import" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Як виконати імпорт
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Експортуйте файл закладок зі свого поточного браузера чи сервісу.</li>
          <li>У Stashly відкрийте <strong className="text-foreground">«Налаштування»</strong> <Settings className="inline size-3.5 mx-0.5 text-muted-foreground align-middle" /> → вкладку <strong className="text-foreground">«Імпорт / Експорт»</strong>.</li>
          <li>Натисніть на відповідний тип файлу (HTML, JSON або CSV) та оберіть його на пристрої.</li>
          <li>Stashly автоматично розпізнає структуру папок та імпортує всі ваші посилання.</li>
        </ol>

        <h2 id="export-backup" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Експорт резервної копії
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          У будь-який момент ви можете завантажити всю свою базу в один клік у форматах <strong>HTML</strong>, <strong>JSON</strong> або <strong>CSV</strong>.
        </p>
      </div>
    ),
  },

  // 9. Масові дії
  {
    slug: 'guides/bulk-actions',
    category: 'guides',
    title: 'Масові дії (Bulk Actions)',
    description: 'Пакетне виділення, масове призначення тегів та швидке очищення бази.',
    lastUpdated: '3 жовтня 2026',
    order: 9,
    toc: [
      { value: 'Вибір закладок', url: '#selecting-items', depth: 2 },
      { value: 'Доступні операції', url: '#available-actions', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <h2 id="selecting-items" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Вибір закладок
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Поставте галочку біля будь-якої закладки, щоб активувати режим масових дій. У верхній частині екрана з'явиться плаваюча панель з лічильником вибраних елементів та кнопкою <strong className="text-foreground">«Обрати всі»</strong>.
        </p>

        <h2 id="available-actions" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Доступні групові операції
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card/40">
            <Tag className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground block text-sm mb-0.5">Масове тегування</strong>
              Додавайте або знімайте один чи кілька тегів з усіх виділених посилань одночасно.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card/40">
            <Sparkles className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground block text-sm mb-0.5">Оновлення метаданих</strong>
              Пакетне пересканування прев'ю-зображень та описів для вибраних матеріалів.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card/40">
            <CheckSquare className="size-4 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground block text-sm mb-0.5">Масове видалення</strong>
              Швидке переміщення вибраних закладок у кошик.
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // 10. Telegram Бот
  {
    slug: 'guides/telegram-bot',
    category: 'guides',
    title: 'Збереження через Telegram-бота',
    description: 'Як підключити Telegram-бота Stashly, зберігати посилання з телефону в 1 клік, додавати теги та шукати закладки.',
    lastUpdated: '4 жовтня 2026',
    order: 10,
    toc: [
      { value: 'Як це працює?', url: '#how-it-works', depth: 2 },
      { value: 'Підключення бота', url: '#linking', depth: 2 },
      { value: 'Збереження посилань та теги', url: '#saving-and-tags', depth: 2 },
      { value: 'Команди бота', url: '#bot-commands', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <h2 id="how-it-works" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Як це працює?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Офіційний бот Stashly у Telegram дозволяє миттєво зберігати веб-посилання прямо зі смартфона або комп'ютера. Ви можете поділитися будь-якою веб-сторінкою з браузера або месенджера через стандартне меню «Share» або просто надіслати URL у чат з ботом.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Send className="size-4 text-[#229ED9]" />
              <span>В 1 клік</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Збереження з мобільних додатків без встановлення додаткових розширень.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Hash className="size-4" />
              <span>Тегування</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Вказуйте #хештеги в тексті, щоб посилання автоматично потрапляло в потрібні категорії.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Sparkles className="size-4" />
              <span>Автопарсинг</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Stashly автоматично витягує заголовок, опис та головне зображення сторінки.
            </p>
          </div>
        </div>

        <h2 id="linking" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Підключення бота
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
          <li>Увійдіть у свій акаунт Stashly на сайті.</li>
          <li>Відкрийте <strong>Налаштування ⚙️</strong> у бічній панелі.</li>
          <li>Перейдіть на вкладку <strong>Telegram Бот</strong>.</li>
          <li>Натисніть <strong>«Підключити Telegram-бота»</strong> та відкрийте згенероване посилання в Telegram.</li>
          <li>Натисніть <strong>Start</strong> у вікні чату — ваш акаунт миттєво зв'яжеться!</li>
        </ol>

        <h2 id="saving-and-tags" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Збереження посилань та теги
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Просто надішліть або перешліть у чат повідомлення з посиланням:
        </p>
        <div className={codeBlockClass}>
          https://github.com/trending #tech #opensource Корисний ресурс для щоденного перегляду
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Бот збереже посилання в Stashly, автоматично створить та прив'яже теги <code>tech</code> і <code>opensource</code>, а решту тексту запише в нотатки/коментарі.
        </p>

        <h2 id="bot-commands" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Команди бота
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>• <code className="text-foreground">/search &lt;запит&gt;</code> — швидкий пошук по ваших закладках прямо в Telegram.</div>
          <div>• <code className="text-foreground">/status</code> — перевірка статусу підключення та прив'язаного акаунту.</div>
          <div>• <code className="text-foreground">/unlink</code> — від'єднання Telegram від облікового запису.</div>
          <div>• <code className="text-foreground">/help</code> — список інструкцій та можливостей.</div>
        </div>
      </div>
    ),
  },

  {
    slug: 'api/introduction',
    category: 'api',
    title: 'Огляд REST API',
    description:
      'Базова адреса, конвенції та можливості публічного REST API Stashly для автоматизацій, скриптів та інтеграцій.',
    lastUpdated: '4 жовтня 2026',
    order: 11,
    toc: [
      { value: 'Базова адреса', url: '#base-url', depth: 2 },
      { value: 'Можливості', url: '#capabilities', depth: 2 },
      { value: 'Формат відповідей', url: '#response-format', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
          <Terminal className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground block mb-1">REST API v1</strong>
            Публічний API для керування закладками програмно: створення, редагування, пошук,
            керування категоріями та публічним доступом. Автентифікація — персональні токени.
          </div>
        </div>

        <h2 id="base-url" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Базова адреса
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Усі ендпоінти доступні з префікса{' '}
          <code className="text-primary bg-primary/10 px-1 py-0.5 rounded font-mono">/api/v1</code>:
        </p>
        <div className={codeBlockClass}>{`https://your-domain.com/api/v1/items
https://your-domain.com/api/v1/tags
https://your-domain.com/api/v1/me`}</div>

        <h2 id="capabilities" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Можливості
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-4">
          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground mb-1">
              <BookOpen className="size-4 text-primary" />
              Закладки
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              CRUD, пагінація, повнотекстовий пошук, фільтр за категорією, керування тегами закладки.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground mb-1">
              <Tag className="size-4 text-primary" />
              Категорії
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Дерево категорій з computed fullPath, створення підкатегорій, переміщення із захистом від циклів.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground mb-1">
              <Globe className="size-4 text-primary" />
              Публічний доступ
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Відкриття, оновлення та закриття публічних посилань на категорії програмно.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground mb-1">
              <KeyRound className="size-4 text-primary" />
              Самокерування токенами
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Створення та відкликання API-токенів прямо з інтеграції (scope <code className="font-mono">tokens:manage</code>).
            </p>
          </div>
        </div>

        <h2 id="response-format" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Формат відповідей
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Успішні відповіді повертають <code className="font-mono">{`{ "data": … }`}</code> (для списків — додатково{' '}
          <code className="font-mono">meta</code> з пагінацією). Помилки —{' '}
          <code className="font-mono">{`{ "error": { "code", "message" } }`}</code>. Детальніше — у розділі{' '}
          <a href="/docs/api/errors-and-limits" className="text-primary hover:underline">
            «Помилки та ліміти»
          </a>
          .
        </p>
        <div className={codeBlockClass}>{`{
  "data": [ ... ],
  "meta": { "page": 1, "per_page": 50, "total": 128 }
}`}</div>
      </div>
    ),
  },

  {
    slug: 'api/authentication',
    category: 'api',
    title: 'Автентифікація та токени',
    description: 'Персональні токени формату st__…, scopes, ревокація та правила безпеки.',
    lastUpdated: '4 жовтня 2026',
    order: 12,
    toc: [
      { value: 'Створення токена', url: '#getting-a-token', depth: 2 },
      { value: 'Формат запиту', url: '#request-format', depth: 2 },
      { value: 'Scopes', url: '#scopes', depth: 2 },
      { value: 'Безпека', url: '#security', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <h2 id="getting-a-token" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Створення токена
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Відкрийте <strong className="text-foreground">Налаштування → API токени</strong>, створіть токен
          з потрібними дозволами та скопіюйте його. Токен має формат{' '}
          <code className="text-primary bg-primary/10 px-1 py-0.5 rounded font-mono">st__&lt;43 символи&gt;</code>{' '}
          і показується <strong className="text-foreground">лише один раз</strong> — на сервері зберігається
          тільки його SHA-256 хеш. Токен можна відкликати в будь-який момент, він перестає працювати негайно.
        </p>
        <div className={codeBlockClass}>{'st__Kj8f2mQ0x7vBnR4pLz9cWd3sYh6tG1uE5oAiM0bXNqC'}</div>

        <h2 id="request-format" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Формат запиту
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Передавайте токен у заголовку{' '}
          <code className="text-primary bg-primary/10 px-1 py-0.5 rounded font-mono">Authorization: Bearer</code>.
          Для перевірки токена існує ендпоінт інтроспекції:
        </p>
        <div className={codeBlockClass}>{'curl -H "Authorization: Bearer st__..." \\\n  https://your-domain.com/api/v1/me'}</div>
        <div className={codeBlockClass}>{`{
  "data": {
    "token_id": 1,
    "user_id": 1,
    "scopes": ["items:read", "tags:read"],
    "name": "n8n автоматизація",
    "last_used_at": "2026-10-04 09:40:21"
  }
}`}</div>

        <h2 id="scopes" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Scopes
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Кожен токен має набір дозволів. Запит до ендпоінта з відсутнім scope повертає{' '}
          <code className="font-mono">403</code>.
        </p>
        <div className="overflow-x-auto my-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-left text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Scope</th>
                <th className="py-2 font-semibold">Що дозволяє</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ['items:read', 'Читання закладок, пошук, пагінація'],
                ['items:write', 'Створення, редагування, видалення закладок'],
                ['tags:read', 'Читання дерева категорій'],
                ['tags:write', 'Створення, редагування, видалення категорій'],
                ['share:write', 'Керування публічними посиланнями категорій'],
                ['tokens:manage', 'Створення та відкликання API-токенів'],
              ].map(([scope, desc]) => (
                <tr key={scope} className="border-b border-border/40">
                  <td className="py-2 pr-4 font-mono text-primary">{scope}</td>
                  <td className="py-2">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="security" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Безпека
        </h2>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
          <KeyRound className="size-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground block mb-1">Правила гігієни токенів</strong>
            Ніколи не вбудовуйте токен у публічний код клієнта. Для CI використовуйте secret-змінні, а для
            кожної інтеграції створюйте окремий токен з мінімальним набором scopes. Якщо токен витік —
            відкличте його в Налаштуваннях і створіть новий.
          </div>
        </div>
      </div>
    ),
  },

  {
    slug: 'api/items',
    category: 'api',
    title: 'Закладки (Items API)',
    description: 'CRUD закладок: список з пагінацією та пошуком, створення, часткове оновлення, видалення.',
    lastUpdated: '4 жовтня 2026',
    order: 13,
    toc: [
      { value: 'Список закладок', url: '#list-items', depth: 2 },
      { value: 'Створення', url: '#create-item', depth: 2 },
      { value: 'Оновлення', url: '#update-item', depth: 2 },
      { value: 'Видалення', url: '#delete-item', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Потрібні scopes: <code className="font-mono text-primary">items:read</code> для читання,{' '}
          <code className="font-mono text-primary">items:write</code> для змін.
        </p>

        <h2 id="list-items" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Список закладок
        </h2>
        <div className={codeBlockClass}>{'GET /api/v1/items?page=1&per_page=50&q=react&tag_id=12'}</div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Параметри: <code className="font-mono">page</code> (від 1), <code className="font-mono">per_page</code>{' '}
          (1–200, за замовчуванням 50), <code className="font-mono">q</code> — пошук за назвою, описом, URL
          та нотатками, <code className="font-mono">tag_id</code> — фільтр за категорією.
        </p>
        <div className={codeBlockClass}>{`{
  "data": [
    {
      "id": 42,
      "title": "React Docs",
      "url": "https://react.dev",
      "description": "...",
      "comments": "",
      "image": "https://react.dev/og.png",
      "tags": [12, 46],
      "created_at": "2026-10-04 09:40:21",
      "updated_at": "2026-10-04 09:40:34"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 128 }
}`}</div>

        <h2 id="create-item" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Створення
        </h2>
        <div className={codeBlockClass}>{`POST /api/v1/items
{
  "title": "React Docs",
  "url": "react.dev",
  "description": "optional",
  "comments": "optional",
  "image": "optional",
  "tags": [12, "читати/пізніше"]
}`}</div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Повертає <code className="font-mono">201</code> з створеним записом. Невідомі числові ID тегів
          ігноруються, рядкові шляхи створюють ланцюжок категорій. <code className="font-mono">https://</code>{' '}
          до URL додається автоматично.
        </p>

        <h2 id="update-item" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Оновлення
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          <code className="font-mono">PATCH /api/v1/items/:id</code> — часткове оновлення: передайте лише
          поля, які треба змінити. Масив <code className="font-mono">tags</code> замінює весь набір тегів
          закладки.
        </p>
        <div className={codeBlockClass}>{`PATCH /api/v1/items/42
{ "title": "Нова назва", "tags": [12] }`}</div>

        <h2 id="delete-item" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Видалення
        </h2>
        <div className={codeBlockClass}>{'DELETE /api/v1/items/42'}</div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Повертає <code className="font-mono">{`{ "data": { "id": 42, "deleted": true } }`}</code> або{' '}
          <code className="font-mono">404</code>, якщо закладка не існує.
        </p>
      </div>
    ),
  },

  {
    slug: 'api/tags-and-sharing',
    category: 'api',
    title: 'Категорії та шеринг',
    description: 'Дерево категорій, CRUD операції, переміщення із захистом від циклів і публічні посилання.',
    lastUpdated: '4 жовтня 2026',
    order: 14,
    toc: [
      { value: 'Дерево категорій', url: '#tag-tree', depth: 2 },
      { value: 'CRUD категорій', url: '#tag-crud', depth: 2 },
      { value: 'Публічні посилання', url: '#sharing', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Потрібні scopes: <code className="font-mono text-primary">tags:read</code> /{' '}
          <code className="font-mono text-primary">tags:write</code>, для шерингу —{' '}
          <code className="font-mono text-primary">share:write</code>.
        </p>

        <h2 id="tag-tree" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Дерево категорій
        </h2>
        <div className={codeBlockClass}>{'GET /api/v1/tags'}</div>
        <div className={codeBlockClass}>{`{
  "data": [
    {
      "id": 46,
      "title": "api",
      "parent": 45,
      "color": "#22c55e",
      "pinned": 0,
      "fullPath": "тест/api",
      "fullPathIDs": "45/46"
    }
  ]
}`}</div>

        <h2 id="tag-crud" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          CRUD категорій
        </h2>
        <div className={codeBlockClass}>{`# Створити підкатегорію
POST /api/v1/tags
{ "title": "UI-бібліотеки", "parent": 12, "color": "#22c55e" }

# Часткове оновлення / переміщення
PATCH /api/v1/tags/46   { "title": "Нове ім'я" }
PATCH /api/v1/tags/46   { "parent": 3 }

# Видалити категорію (опційно — разом із закладками)
DELETE /api/v1/tags/46?delete_bookmarks=true`}</div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
          <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground block mb-1">Захист від циклів</strong>
            Спроба перемістити категорію під власного нащадка повертає{' '}
            <code className="font-mono">422</code> — дерево завжди залишається ациклічним.
          </div>
        </div>

        <h2 id="sharing" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Публічні посилання
        </h2>
        <div className={codeBlockClass}>{`# Відкрити доступ (idempotentно)
POST /api/v1/tags/46/share          { "action": "enable" }

# Згенерувати нове посилання (старе перестає працювати)
POST /api/v1/tags/46/share          { "action": "regenerate" }

# Статус
GET /api/v1/tags/46/share

# Закрити доступ
DELETE /api/v1/tags/46/share`}</div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Публічна сторінка доступна за адресою{' '}
          <code className="font-mono">https://your-domain.com/share/&lt;share_id&gt;</code> без авторизації.
        </p>
      </div>
    ),
  },

  {
    slug: 'api/errors-and-limits',
    category: 'api',
    title: 'Помилки та ліміти',
    description: 'Формат помилок, HTTP статуси, rate limiting та CORS.',
    lastUpdated: '4 жовтня 2026',
    order: 15,
    toc: [
      { value: 'Формат помилок', url: '#error-format', depth: 2 },
      { value: 'HTTP статуси', url: '#status-codes', depth: 2 },
      { value: 'Rate limiting та CORS', url: '#rate-limits', depth: 2 },
    ],
    content: (
      <div className="space-y-6">
        <h2 id="error-format" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground">
          Формат помилок
        </h2>
        <div className={codeBlockClass}>{`{
  "error": {
    "code": "validation_error",
    "message": "Invalid request body",
    "details": { "title": ["Title is required"] }
  }
}`}</div>

        <h2 id="status-codes" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          HTTP статуси
        </h2>
        <div className="overflow-x-auto my-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-left text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Статус</th>
                <th className="py-2 font-semibold">Значення</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ['200', 'Успішний запит'],
                ['201', 'Ресурс створено'],
                ['401', 'Токен відсутній, невірний або відкликаний'],
                ['403', 'У токена немає потрібного scope'],
                ['404', 'Ресурс не знайдено (або належить іншому користувачу)'],
                ['422', 'Помилка валідації тіла запиту (details містить поля)'],
                ['429', 'Перевищено ліміт запитів'],
                ['500', 'Внутрішня помилка сервера'],
              ].map(([code, desc]) => (
                <tr key={code} className="border-b border-border/40">
                  <td className="py-2 pr-4 font-mono text-primary">{code}</td>
                  <td className="py-2">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="rate-limits" className="scroll-m-20 text-2xl font-bold tracking-tight text-foreground pt-4">
          Rate limiting та CORS
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Ліміт — <strong className="text-foreground">120 запитів на хвилину на токен</strong>. При
          перевищенні повертається <code className="font-mono">429</code> — додайте backoff у свою
          інтеграцію. CORS відкритий для будь-яких origin, preflight-запити (OPTIONS) підтримуються.
        </p>
        <div className={codeBlockClass}>{`curl -i -X OPTIONS https://your-domain.com/api/v1/items
# access-control-allow-origin: *
# access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS
# access-control-allow-headers: Content-Type, Authorization`}</div>
      </div>
    ),
  },
];

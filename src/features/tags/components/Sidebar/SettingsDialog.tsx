'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { mainStore } from '@/store/mainStore';
import { preferencesStore } from '@/store/preferencesStore';
import { observer } from 'mobx-react-lite';
import {
  Download,
  Upload,
  FileCode2,
  FileSpreadsheet,
  FileJson,
  Sliders,
  Database,
  Moon,
  Sun,
  SunMoon,
  Check,
  X,
  BookOpen,
  User,
  KeyRound,
} from 'lucide-react';
import { Github } from '@/components/social-icons/icons';
import siteMetadata from '@/data/siteMetadata';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { useTheme, Theme } from '@/components/ThemeProvider';
import { cn, colorHexMap, TAG_COLOR_OPTIONS } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ApiTokensTab } from './ApiTokensTab';
import { TelegramTab } from './TelegramTab';
import { Send } from 'lucide-react';

const colorOptions = TAG_COLOR_OPTIONS;

export const SettingsDialog = observer(({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const store = mainStore;
  const prefStore = preferencesStore;
  const { theme, setTheme } = useTheme();

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>('personalization');
  const [importSourceName, setImportSourceName] = React.useState('Браузер');
  const [isImporting, setIsImporting] = React.useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      let format = 'auto';
      if (file.name.endsWith('.json')) format = 'json';
      else if (file.name.endsWith('.csv')) format = 'csv';
      else format = 'html';

      const success = await store.importBookmarks(
        file,
        'file',
        '/api/import/bookmarks',
        importSourceName,
        format
      );
      if (success) {
        toast.success(`Закладки успішно імпортовано!`, { position: 'top-center' });
        onOpenChange(false);
      }
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerImport = (type: 'html' | 'json' | 'csv', source: string) => {
    setImportSourceName(source);
    if (fileInputRef.current) {
      if (type === 'html') fileInputRef.current.accept = '.html,.htm';
      else if (type === 'json') fileInputRef.current.accept = '.json';
      else if (type === 'csv') fileInputRef.current.accept = '.csv';
      fileInputRef.current.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] md:w-[680px] h-[520px] max-h-[520px] min-h-[520px] p-0 gap-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl bg-card flex flex-col"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Налаштування Stashly</DialogTitle>
          <DialogDescription>
            Керування темами, кольоровими акцентами, імпортом та експортом закладок.
          </DialogDescription>
        </DialogHeader>

        {/* Hidden native file input for imports */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col md:flex-row flex-1 h-full min-h-0 overflow-hidden gap-0"
        >
          {/* Settings Left Navigation Sidebar */}
          <aside className="border-b md:border-b-0 md:border-r border-border/60 bg-muted/20 flex flex-col justify-between shrink-0 md:w-52 h-full min-h-0 overflow-hidden">
            <div className="flex flex-col w-full">
              {/* Sidebar Header with exact height h-14 */}
              <div className="h-14 px-4 flex items-center border-b border-border/50 shrink-0">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">Налаштування</h2>
              </div>

              {/* Navigation tabs */}
              <div className="p-2 space-y-1">
                <TabsList className="flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar bg-transparent p-0 h-auto w-full">
                  <TabsTrigger
                    value="personalization"
                    className="h-9 flex-1 md:flex-none flex items-center justify-start gap-2.5 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  >
                    <Sliders className="size-4 text-primary shrink-0" />
                    <span>Персоналізація</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="import-export"
                    className="h-9 flex-1 md:flex-none flex items-center justify-start gap-2.5 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  >
                    <Database className="size-4 text-primary shrink-0" />
                    <span>Імпорт / Експорт</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="telegram"
                    className="h-9 flex-1 md:flex-none flex items-center justify-start gap-2.5 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  >
                    <Send className="size-4 text-[#229ED9] shrink-0" />
                    <span>Telegram Бот</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="api"
                    className="h-9 flex-1 md:flex-none flex items-center justify-start gap-2.5 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  >
                    <KeyRound className="size-4 text-primary shrink-0" />
                    <span>API токени</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Desktop Quick links footer */}
            <div className="hidden md:flex flex-col gap-1 p-2 border-t border-border/50 bg-muted/10">
              <Link
                href="/docs"
                onClick={() => onOpenChange(false)}
                className="h-9 flex items-center gap-2.5 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all cursor-pointer"
              >
                <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                <span>Документація</span>
              </Link>
              <a
                href="https://github.com/ihornone"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 flex items-center gap-2.5 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all cursor-pointer"
              >
                <User className="size-4 shrink-0 text-muted-foreground" />
                <span>Про автора</span>
              </a>
              <a
                href={siteMetadata.github}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 flex items-center gap-2.5 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all cursor-pointer"
              >
                <Github className="size-4 shrink-0 fill-current text-muted-foreground" />
                <span>GitHub</span>
              </a>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-card">
            {/* Unified Top Header Bar with exact height h-14 and Single Close Button */}
            <div className="h-14 px-6 flex items-center justify-between border-b border-border/50 shrink-0">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                {activeTab === 'personalization'
                  ? 'Персоналізація'
                  : activeTab === 'telegram'
                    ? 'Telegram Бот'
                    : activeTab === 'api'
                      ? 'API токени'
                      : 'Імпорт / Експорт'}
              </span>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Закрити"
                >
                  <X className="size-4" />
                </Button>
              </DialogClose>
            </div>

            {/* Tab 1: Personalization */}
            <TabsContent
              value="personalization"
              className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5 animate-in fade-in-50 duration-150 mt-0 data-[state=inactive]:hidden"
            >
              {/* Theme Selector: 3 uniform height h-20 cards */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2.5">
                  Тема інтерфейсу
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'light', label: 'Світла', icon: Sun },
                    { key: 'dark', label: 'Темна', icon: Moon },
                    { key: 'system', label: 'Системна', icon: SunMoon },
                  ].map(({ key, label, icon: Icon }) => {
                    const isSelected = theme === key;
                    const accentHex = colorHexMap[prefStore.accentColor] || '#2563eb';
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setTheme(key as Theme)}
                        style={isSelected ? { borderColor: accentHex } : undefined}
                        className={cn(
                          'h-20 flex flex-col items-center justify-center gap-2 rounded-xl border text-xs font-medium transition-all cursor-pointer',
                          isSelected
                            ? 'bg-accent/40 text-foreground shadow-xs font-semibold ring-1 ring-offset-0'
                            : 'border-border/60 bg-card/60 text-muted-foreground hover:text-foreground hover:bg-accent/40 hover:border-border'
                        )}
                      >
                        <Icon className="size-5" style={isSelected ? { color: accentHex } : undefined} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-border/50" />

              {/* Accent Color Picker: 8 uniform cells */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2.5">
                  Колір акценту
                </span>
                <div className="grid grid-cols-8 gap-2 w-full">
                  {colorOptions.map(({ key, label }) => {
                    const isSelected = prefStore.accentColor === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        title={label}
                        onClick={() => prefStore.setAccentColor(key)}
                        className={cn(
                          'h-8 w-full rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs',
                          isSelected
                            ? 'ring-2 ring-foreground ring-offset-2 ring-offset-card scale-102'
                            : 'opacity-85 hover:opacity-100 hover:scale-102'
                        )}
                        style={{ backgroundColor: colorHexMap[key] }}
                      >
                        {isSelected && <Check className="size-4 text-white stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-border/50" />

              {/* Preferences switches: 2 uniform h-12 rows */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2.5">
                  Бічна панель та теги
                </span>
                <div className="space-y-2">
                  <div className="h-12 px-4 rounded-xl border border-border/60 bg-card/40 flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      Включати елементи вкладених тегів
                    </span>
                    <Switch
                      checked={prefStore.includeNestedTagItems}
                      onCheckedChange={(checked) => prefStore.setIncludeNestedTagItems(checked)}
                    />
                  </div>

                  <div className="h-12 px-4 rounded-xl border border-border/60 bg-card/40 flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      Показувати кількість елементів
                    </span>
                    <Switch
                      checked={prefStore.displaySidebarTagItemCounts}
                      onCheckedChange={(checked) => prefStore.setDisplaySidebarTagItemCounts(checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Import / Export */}
            <TabsContent
              value="import-export"
              className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5 animate-in fade-in-50 duration-150 mt-0 data-[state=inactive]:hidden"
            >
              {/* Import Section: 3 uniform height h-20 cards */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Upload className="size-3.5 text-primary" />
                  <span>Імпорт закладок</span>
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={() => triggerImport('html', 'Chrome/Firefox/Safari')}
                    className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/40 hover:border-primary/50 text-xs font-medium transition-all cursor-pointer"
                  >
                    <FileCode2 className="size-5 text-blue-500" />
                    <span className="text-foreground text-xs font-medium">HTML файл</span>
                  </button>

                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={() => triggerImport('json', 'JSON Backup')}
                    className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/40 hover:border-primary/50 text-xs font-medium transition-all cursor-pointer"
                  >
                    <FileJson className="size-5 text-amber-500" />
                    <span className="text-foreground text-xs font-medium">JSON файл</span>
                  </button>

                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={() => triggerImport('csv', 'CSV')}
                    className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/40 hover:border-primary/50 text-xs font-medium transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="size-5 text-emerald-500" />
                    <span className="text-foreground text-xs font-medium">CSV таблиця</span>
                  </button>
                </div>

                {isImporting && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse p-2.5 bg-muted/40 rounded-xl mt-3">
                    <Spinner className="size-4" /> Імпортуємо закладки...
                  </div>
                )}
              </div>

              <div className="border-t border-border/50" />

              {/* Export Section: 3 uniform height h-11 buttons */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Download className="size-3.5 text-primary" />
                  <span>Експорт бази</span>
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="secondary"
                    className="h-11 justify-center gap-2 text-xs rounded-xl font-medium cursor-pointer"
                    onClick={() => store.exportBookmarks('html')}
                  >
                    <FileCode2 className="size-4 text-blue-500" /> HTML
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-11 justify-center gap-2 text-xs rounded-xl font-medium cursor-pointer"
                    onClick={() => store.exportBookmarks('json')}
                  >
                    <FileJson className="size-4 text-amber-500" /> JSON
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-11 justify-center gap-2 text-xs rounded-xl font-medium cursor-pointer"
                    onClick={() => store.exportBookmarks('csv')}
                  >
                    <FileSpreadsheet className="size-4 text-emerald-500" /> CSV
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Telegram Bot */}
            <TabsContent
              value="telegram"
              className="flex-1 min-h-0 overflow-y-auto p-0 animate-in fade-in-50 duration-150 mt-0 data-[state=inactive]:hidden"
            >
              <TelegramTab />
            </TabsContent>

            {/* Tab 4: API Tokens */}
            <TabsContent
              value="api"
              className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5 animate-in fade-in-50 duration-150 mt-0 data-[state=inactive]:hidden"
            >
              <p className="text-xs text-muted-foreground -mt-1">
                Створюйте персональні токени для REST API (<code className="font-mono">/api/v1</code>) —
                автоматизації, скрипти та інтеграції. Формат: <code className="font-mono">st__…</code>
              </p>
              <ApiTokensTab />
            </TabsContent>
          </main>
        </Tabs>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-border/60 bg-muted/20 px-2 py-2 text-xs shrink-0">
          <Link
            href="/docs"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all cursor-pointer"
          >
            <BookOpen className="size-3.5 shrink-0" />
            <span>Документація</span>
          </Link>
          <div className="h-3 w-px bg-border/60" />
          <a
            href="https://github.com/ihornone"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all cursor-pointer"
          >
            <User className="size-3.5 shrink-0" />
            <span>Про автора</span>
          </a>
          <div className="h-3 w-px bg-border/60" />
          <a
            href={siteMetadata.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all cursor-pointer"
          >
            <Github className="size-3.5 shrink-0 fill-current" />
            <span>GitHub</span>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
});

'use client';

import React from 'react';
import { Laptop, Lightbulb, MoreVertical, Apple, Smartphone, Globe } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export const PwaPlatformTabs: React.FC = () => {
  return (
    <Tabs defaultValue="ios" className="space-y-4">
      <TabsList className="w-full flex gap-2 p-1 bg-muted/40 rounded-xl border border-border/60 h-auto">
        <TabsTrigger
          value="ios"
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
        >
          <Apple className="size-4" />
          <span>iOS (iPhone/iPad)</span>
        </TabsTrigger>
        <TabsTrigger
          value="android"
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
        >
          <Smartphone className="size-4" />
          <span>Android</span>
        </TabsTrigger>
        <TabsTrigger
          value="desktop"
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
        >
          <Laptop className="size-4" />
          <span>Desktop (ПК/Mac)</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ios" id="ios" className="space-y-4 p-5 rounded-2xl border border-border/60 bg-card/40 animate-in fade-in-50">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
          <Apple className="size-5 text-primary" />
          Встановлення на iPhone / iPad (Safari)
        </h3>
        <ol className="list-decimal list-inside space-y-2.5 text-sm text-muted-foreground">
          <li>Відкрийте Stashly у браузері <strong>Safari</strong>.</li>
          <li>Натисніть кнопку <strong className="text-foreground">«Поділитися»</strong> (квадрат зі стрілкою вгору) внизу екрана.</li>
          <li>Прокрутіть меню вниз та оберіть <strong className="text-foreground">«На початковий екран» (Add to Home Screen)</strong>.</li>
          <li>Підтвердіть додавання, натиснувши <strong className="text-foreground">«Додати»</strong> у правому верхньому кутку.</li>
        </ol>
        <div className="p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground flex items-center gap-2">
          <Lightbulb className="size-4 text-amber-500 shrink-0" />
          <span><em>Порада:</em> Тепер ви можете надсилати посилання у Stashly з будь-якої програми через системне меню «Поділитися».</span>
        </div>
      </TabsContent>

      <TabsContent value="android" id="android" className="space-y-4 p-5 rounded-2xl border border-border/60 bg-card/40 animate-in fade-in-50">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
          <Smartphone className="size-5 text-emerald-500" />
          Встановлення на Android (Chrome)
        </h3>
        <ol className="list-decimal list-inside space-y-2.5 text-sm text-muted-foreground">
          <li>Відкрийте сервіс у <strong>Google Chrome</strong>.</li>
          <li>Натисніть меню з трьома крапками <MoreVertical className="inline size-3.5 mx-0.5 text-muted-foreground align-middle" /> у верхньому правому кутку.</li>
          <li>Виберіть пункт <strong className="text-foreground">«Встановити додаток»</strong> або <strong className="text-foreground">«Додати на головний екран»</strong>.</li>
          <li>Натисніть <strong className="text-foreground">«Встановити»</strong> у вікні підтвердження.</li>
        </ol>
      </TabsContent>

      <TabsContent value="desktop" id="desktop" className="space-y-4 p-5 rounded-2xl border border-border/60 bg-card/40 animate-in fade-in-50">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
          <Globe className="size-5 text-blue-500" />
          Встановлення на комп'ютер (Chrome / Edge / macOS)
        </h3>
        <ol className="list-decimal list-inside space-y-2.5 text-sm text-muted-foreground">
          <li>Відкрийте сайт у браузері <strong>Google Chrome</strong> або <strong>Microsoft Edge</strong>.</li>
          <li>Праворуч в адресному рядку з'явиться значок <strong className="text-foreground">«Встановити додаток»</strong> (екран зі стрілкою).</li>
          <li>Натисніть його і підтвердіть встановлення. Додаток з'явиться в меню додатків або панелі Dock.</li>
        </ol>
      </TabsContent>
    </Tabs>
  );
};

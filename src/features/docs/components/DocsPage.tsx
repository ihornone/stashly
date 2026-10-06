'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, RocketIcon, BookOpenIcon, Terminal, FolderIcon, Menu } from 'lucide-react';
import { Navbar, Footer } from '@/features/landing';
import { allDocs, DocItem } from '@/data/docs';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const SECTION_ICONS: Record<string, React.ElementType> = {
  'getting-started': RocketIcon,
  guides: BookOpenIcon,
  api: Terminal,
};

const formatCategory = (category: string) => {
  if (category === 'getting-started') return 'Початок роботи';
  if (category === 'guides') return 'Посібники користувача';
  if (category === 'api') return 'REST API для розробників';
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface DocsPageProps {
  activeSlug?: string;
  onNavigate?: (slug: string) => void;
}

export const DocsPage: React.FC<DocsPageProps> = ({ activeSlug = 'getting-started/introduction', onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const handleNavigate = () => {
    // Called from Link onClick — close the mobile sheet; navigation itself is a real <Link>
    if (onNavigate) {
      onNavigate(activeSlug);
    }
    setSidebarOpen(false);
  };

  // Resolve matching document
  const normalizedSearch = activeSlug.replace(/^\/?(docs\/)?/, '');
  const currentDoc =
    allDocs.find((d) => d.slug === normalizedSearch) ||
    allDocs.find((d) => d.slug.endsWith(normalizedSearch)) ||
    allDocs[0];

  const currentIndex = allDocs.findIndex((d) => d.slug === currentDoc.slug);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  // Group docs by category
  const groupedDocs = allDocs.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, DocItem[]>);

  const toggleSection = (cat: string) => {
    setCollapsedSections((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const renderNavList = () => (
    <nav className="space-y-6">
      <div className="mb-2">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Документація
        </h2>
      </div>

      {Object.entries(groupedDocs).map(([docCategory, docs]) => {
        const isCollapsed = !collapsedSections[docCategory] ? false : true;
        const Icon = SECTION_ICONS[docCategory] ?? FolderIcon;
        return (
          <div key={docCategory}>
            <button
              onClick={() => toggleSection(docCategory)}
              className="text-sidebar-foreground hover:text-foreground mb-1 flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-sm font-semibold transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
                {formatCategory(docCategory)}
              </span>
              <ChevronDownIcon
                className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 ${
                  isCollapsed ? '-rotate-90' : ''
                }`}
              />
            </button>
            {!isCollapsed && (
              <ul className="space-y-1">
                {docs.map((doc) => {
                  const isActive = doc.slug === currentDoc.slug;
                  return (
                    <li key={doc.slug}>
                      <Link
                        href={`/docs/${doc.slug}`}
                        onClick={handleNavigate}
                        aria-current={isActive ? 'page' : undefined}
                        className={`block w-full text-left rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        }`}
                      >
                        {doc.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <div className="max-w-container mx-auto w-full flex-1">
        <div className="flex flex-col md:flex-row">
          {/* Mobile menu toggle */}
          <Button
            onClick={() => setSidebarOpen(true)}
            className="fixed right-4 bottom-4 z-40 rounded-full size-12 shadow-lg md:hidden cursor-pointer"
            aria-label="Перемкнути меню документації"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Mobile Sheet Drawer */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-72 p-6 overflow-y-auto">
              <SheetTitle className="sr-only">Навігація документації</SheetTitle>
              {renderNavList()}
            </SheetContent>
          </Sheet>

          {/* Left Desktop Sidebar */}
          <aside className="hidden md:block w-72 flex-shrink-0 overflow-y-auto pt-10 pb-4 md:sticky md:top-15 md:h-auto md:max-h-[calc(100vh-3.75rem)] md:self-start">
            <div className="px-4 xl:pl-0">
              {renderNavList()}
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="min-w-0 flex-1 px-4 py-8 md:px-8">
            <article className="mx-auto max-w-3xl">
              {/* Breadcrumbs */}
              <nav aria-label="Breadcrumb" className="mb-4">
                <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm">
                  <li>
                    <Link
                      href="/docs/getting-started/introduction"
                      className="hover:text-foreground transition-colors cursor-pointer"
                    >
                      Документація
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>{formatCategory(currentDoc.category)}</li>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page" className="text-foreground font-medium">
                    {currentDoc.title}
                  </li>
                </ol>
              </nav>

              {/* Header */}
              <header className="border-border/20 mb-8 border-b pb-8">
                <h1 className="text-foreground mb-2 text-3xl sm:text-4xl font-bold tracking-tight">
                  {currentDoc.title}
                </h1>
                {currentDoc.description && (
                  <p className="text-muted-foreground mt-3 text-lg leading-relaxed font-light">
                    {currentDoc.description}
                  </p>
                )}
              </header>

              {/* Body */}
              <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:scroll-m-20 prose-headings:tracking-tight prose-img:rounded-md prose-img:border">
                {currentDoc.content}
              </div>

              {/* Last updated */}
              <div className="text-muted-foreground mt-10 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-end border-t border-border/20 pt-6">
                <span>Останнє оновлення: {currentDoc.lastUpdated}</span>
              </div>

              {/* Prev / Next Bottom Navigation */}
              {(prevDoc || nextDoc) && (
                <nav
                  aria-label="Docs pages"
                  className="border-border dark:border-border/10 mt-12 flex flex-col gap-4 border-t pt-8 sm:flex-row"
                >
                  {prevDoc ? (
                    <Link
                      href={`/docs/${prevDoc.slug}`}
                      onClick={handleNavigate}
                      className="group border-border/10 hover:border-border/40 flex-1 rounded-lg border p-4 text-left transition-colors cursor-pointer"
                    >
                      <span className="text-muted-foreground text-xs">Попередня</span>
                      <span className="text-foreground mt-1 block text-sm font-medium group-hover:text-primary transition-colors">
                        {prevDoc.title}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex-1" />
                  )}
                  {nextDoc ? (
                    <Link
                      href={`/docs/${nextDoc.slug}`}
                      onClick={handleNavigate}
                      className="group border-border/10 hover:border-border/40 flex-1 rounded-lg border p-4 text-right transition-colors cursor-pointer"
                    >
                      <span className="text-muted-foreground text-xs">Наступна</span>
                      <span className="text-foreground mt-1 block text-sm font-medium group-hover:text-primary transition-colors">
                        {nextDoc.title}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex-1" />
                  )}
                </nav>
              )}
            </article>
          </div>

          {/* Right Table of Contents */}
          {currentDoc.toc.length > 0 && (
            <aside className="hidden w-56 flex-shrink-0 xl:block">
              <nav
                aria-label="На цій сторінці"
                className="sticky top-15 max-h-[calc(100vh-3.75rem)] overflow-y-auto py-10 pr-1"
              >
                <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
                  На цій сторінці
                </h2>
                <ul className="space-y-2 text-sm">
                  {currentDoc.toc.map((item) => (
                    <li key={item.url} className={item.depth >= 3 ? 'pl-4' : ''}>
                      <a
                        href={item.url}
                        className="block text-muted-foreground hover:text-primary transition-colors text-xs"
                      >
                        {item.value}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DocsPage;

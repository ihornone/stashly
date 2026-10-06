import { makeAutoObservable, autorun, runInAction } from 'mobx';
import { colorHexMap } from '@/lib/utils';
import { API_ENDPOINTS } from './api';

class PreferencesStore {
  includeNestedTagItems = false;
  displaySidebarTagItemCounts = true;
  accentColor = 'aqua'; // default matching tag blue

  constructor() {
    makeAutoObservable(this);

    this.load();

    // Auto-save to localStorage and apply CSS variable on changes
    autorun(() => {
      const data = {
        includeNestedTagItems: this.includeNestedTagItems,
        displaySidebarTagItemCounts: this.displaySidebarTagItemCounts,
        accentColor: this.accentColor,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('app:preferences', JSON.stringify(data));
        this.applyAccentColor(this.accentColor);
      }
    });

    // Fetch from database on client start
    if (typeof window !== 'undefined') {
      this.fetchFromDb();
    }
  }

  applyAccentColor = (colorKey: string) => {
    if (typeof window === 'undefined') return;
    const hex = colorHexMap[colorKey] || colorKey || '#2563eb';
    const root = document.documentElement;
    root.style.setProperty('--accent-color', hex);
  };

  load() {
    try {
      if (typeof window === 'undefined') return;
      const stored = localStorage.getItem('app:preferences');
      if (!stored) {
        this.applyAccentColor(this.accentColor);
        return;
      }

      const data = JSON.parse(stored);
      Object.assign(this, data);
      if (this.accentColor) {
        this.applyAccentColor(this.accentColor);
      }
    } catch {
      // Ignore storage errors
    }
  }

  fetchFromDb = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.settings.preferences);
      if (res.ok) {
        const json = await res.json();
        if (json.data?.preferences) {
          runInAction(() => {
            Object.assign(this, json.data.preferences);
            if (this.accentColor) {
              this.applyAccentColor(this.accentColor);
            }
          });
        }
      }
    } catch {
      // Offline / fallback to local storage
    }
  };

  saveToDb = async () => {
    try {
      await fetch(API_ENDPOINTS.settings.preferences, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          includeNestedTagItems: this.includeNestedTagItems,
          displaySidebarTagItemCounts: this.displaySidebarTagItemCounts,
          accentColor: this.accentColor,
        }),
      });
    } catch {
      // Silent error handled by localStorage fallback
    }
  };

  setAccentColor = (color: string) => {
    this.accentColor = color;
    this.applyAccentColor(color);
    this.saveToDb();
  };

  setIncludeNestedTagItems = (val: boolean) => {
    this.includeNestedTagItems = val;
    this.saveToDb();
  };

  setDisplaySidebarTagItemCounts = (val: boolean) => {
    this.displaySidebarTagItemCounts = val;
    this.saveToDb();
  };
}

export const preferencesStore = new PreferencesStore();


/**
 * Centralized Typed Route Constants according to rules/web-project-structure
 */

export const Routes = {
  HOME: '/',
  APP: '/app',
  CREATE_ITEM: '/app/create-item',
  EDIT_ITEM: (id: string | number) => `/app/edit-item/${id}`,
  DOCS: '/docs',
  DOC_PAGE: (slug: string) => `/docs/${slug}`,
  SHARE: (id: string) => `/share/${id}`,
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  
  // API Routes
  API: {
    ITEMS: '/api/items',
    ITEMS_DELETE: '/api/items/delete',
    ITEMS_FETCH_METADATA: '/api/items/fetch-metadata',
    ITEMS_TAGS: '/api/items/tags',
    TAGS: '/api/tags',
    TAGS_UPDATE: '/api/tags/update',
    TAGS_UPDATE_COLOR: '/api/tags/update-color',
    TAGS_UPDATE_PINNED: '/api/tags/update-pinned',
    TAGS_SHARE: '/api/tags/share',
    TELEGRAM_WEBHOOK: '/api/telegram/webhook',
    TELEGRAM_LINK: '/api/settings/telegram',
    EXPORT: '/api/export',
    IMPORT: '/api/import/bookmarks',
    URL_CHECK: '/api/url/check-broken',
    URL_METADATA: '/api/url/fetch-metadata',
    SETTINGS_PREFERENCES: '/api/settings/preferences',
    SETTINGS_TOKENS: '/api/settings/tokens',
    V1: {
      ME: '/api/v1/me',
      ITEMS: '/api/v1/items',
      ITEM: (id: string | number) => `/api/v1/items/${id}`,
      TAGS: '/api/v1/tags',
      TAG: (id: string | number) => `/api/v1/tags/${id}`,
      TOKENS: '/api/v1/tokens',
      TOKEN: (id: string | number) => `/api/v1/tokens/${id}`,
    },
  },
} as const;

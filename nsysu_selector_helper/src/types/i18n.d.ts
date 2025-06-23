import enJson from '@/i18n/locales/zh-TW/translation.json';

// 1) build “parent.child.grandchild” from nested objects
type Prefix<K extends string, P extends string> = P extends ''
  ? K
  : `${P}.${K}`;

// 2) walk the JSON type, emit every path
type Paths<T, P extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? Prefix<K, P> | Paths<T[K], Prefix<K, P>>
        : Prefix<K, P>;
    }[keyof T & string]
  : never;

// 3) your dynamic union of ALL allowed keys
export type TranslationKey = Paths<typeof enJson>;

// 4) tell i18next exactly what shape “translation” has
const resources = { translation: enJson } as const;
declare module 'i18next' {
  interface CustomTypeOptions {
    // i18next.t() now only accepts keys from TranslationKey
    resources: typeof resources;
  }
}

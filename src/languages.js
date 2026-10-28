/**
 * Language catalog shared by the Host half and the Client page.
 *
 * Keep this list to widely used languages. `name` is the English name used in
 * the prompt, `native` is what a reader of that language expects to see in the
 * settings page.
 */

/** @typedef {{ id: string, name: string, native: string, zh: string }} Language */

/** @type {readonly Language[]} */
export const LANGUAGES = Object.freeze([
  { id: 'zh', name: 'Simplified Chinese', native: '简体中文', zh: '简体中文' },
  { id: 'en', name: 'English', native: 'English', zh: '英语' },
  { id: 'ja', name: 'Japanese', native: '日本語', zh: '日语' },
  { id: 'ko', name: 'Korean', native: '한국어', zh: '韩语' },
  { id: 'fr', name: 'French', native: 'Français', zh: '法语' },
  { id: 'de', name: 'German', native: 'Deutsch', zh: '德语' },
  { id: 'es', name: 'Spanish', native: 'Español', zh: '西班牙语' },
  { id: 'pt', name: 'Portuguese', native: 'Português', zh: '葡萄牙语' },
  { id: 'ru', name: 'Russian', native: 'Русский', zh: '俄语' },
]);

/** Sentinel ids that are not real languages. */
export const AUTO_ID = 'auto';
export const DEFAULT_ID = 'default';

/** @type {ReadonlySet<string>} */
const LANGUAGE_IDS = new Set(LANGUAGES.map((language) => language.id));

/**
 * @param {unknown} id
 * @returns {boolean} whether `id` names a catalogued language.
 */
export function isLanguageId(id) {
  return typeof id === 'string' && LANGUAGE_IDS.has(id);
}

/**
 * @param {string} id
 * @returns {Language | undefined}
 */
export function findLanguage(id) {
  return LANGUAGES.find((language) => language.id === id);
}

/**
 * Human label for one selection, used in tool results and page summaries.
 * @param {string} id
 * @param {'zh' | 'en'} uiLocale
 */
export function labelOf(id, uiLocale = 'zh') {
  if (id === AUTO_ID) return uiLocale === 'en' ? 'Follow the user' : '跟随用户';
  if (id === DEFAULT_ID) return uiLocale === 'en' ? 'Model default' : '模型默认';
  const language = findLanguage(id);
  if (language === undefined) return id;
  return uiLocale === 'en' ? language.name : language.zh;
}

/** Defaults, also used when the state file is missing or damaged. */
export const DEFAULTS = Object.freeze({
  mode: 'sync',
  thinking: 'en',
  response: 'zh',
  enforce: true,
});

/** Accepts `sync` or `separate`; anything else falls back to `sync`. */
export function normalizeMode(value) {
  return value === 'separate' ? 'separate' : 'sync';
}

/** Accepts a catalogued id or one of the sentinels; anything else is `undefined`. */
export function normalizeChoice(value, fallback) {
  if (value === AUTO_ID || value === DEFAULT_ID) return value;
  if (isLanguageId(value)) return value;
  return fallback;
}

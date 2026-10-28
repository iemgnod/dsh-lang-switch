/**
 * Prompt text for the language section.
 *
 * The section is generated per turn from the stored state, so a change made in
 * the settings page (or by the `lang_switch` tool) applies to the very next
 * message without a Host restart.
 */

import { AUTO_ID, DEFAULT_ID, labelOf } from './languages.js';

/**
 * One clause describing what a single selection means.
 * @param {string} choice
 * @param {'thinking' | 'response'} slot
 */
function clause(choice) {
  if (choice === AUTO_ID) return 'Its language matches the language of the user’s latest message.';
  if (choice === DEFAULT_ID) return 'No language is imposed for it; choose whatever reads most naturally.';
  return `Write it in ${labelOf(choice, 'en')}.`;
}

/**
 * @typedef {{ mode: 'sync' | 'separate', thinking: string, response: string, enforce: boolean }} LangState
 */

/**
 * @param {LangState} state
 * @returns {string[]}
 */
export function buildPromptLines(state) {
  if (!state.enforce) return [];
  const thinking = state.mode === 'sync' ? state.response : state.thinking;
  const lines = [
    '<language>',
    'Two different things have a language, and they can differ:',
    `- Thinking (your reasoning, plans and intermediate notes visible to the user): ${clause(thinking)}`,
    `- Final response (the answer you actually deliver): ${clause(state.response)}`,
  ];
  if (state.mode === 'sync') {
    lines.push('Both use the same language, as set above.');
  } else if (thinking !== state.response) {
    lines.push('These two are deliberately different; do not let one drift into the other.');
  }
  if (state.response === AUTO_ID) {
    lines.push('When you switch to replying in another language, switch the thinking language with it.');
  }
  lines.push(
    'Never translate code, identifiers, file paths, commands, URLs, log output or quoted text:'
      + ' keep them exactly as written, and only translate the prose around them.',
    '</language>',
  );
  return lines;
}

/**
 * Short human summary of the state, in the language of the UI locale.
 * @param {LangState} state
 * @param {'zh' | 'en'} locale
 */
export function describeState(state, locale) {
  const thinking = state.mode === 'sync' ? state.response : state.thinking;
  if (locale === 'en') {
    return `thinking in ${labelOf(thinking, 'en')}, replying in ${labelOf(state.response, 'en')}`;
  }
  return `思考使用${labelOf(thinking, 'zh')}，回复使用${labelOf(state.response, 'zh')}`;
}

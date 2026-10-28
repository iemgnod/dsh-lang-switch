/**
 * Host half of dsh-lang-switch.
 *
 * Owns the stored choice and contributes it to the system prompt. The Client
 * page and the `lang_switch` tool both go through `store.write`, so the two
 * always agree.
 */

import { LANGUAGES } from './languages.js';
import { buildPromptLines } from './prompt.js';
import { registerLangRoutes } from './routes.js';
import { LangStore } from './store.js';
import { registerSwitchTool } from './tools.js';

export const name = 'dsh-lang-switch';
export const inject = ['systemPrompt', 'webServer', 'tools'];

/** @typedef {{ file?: string }} LangConfig */

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {LangConfig} [rawConfig]
 */
export function apply(ctx, rawConfig = {}) {
  const config = rawConfig ?? {};
  const logger = ctx.logger ?? ctx.get?.('logger');
  const store = new LangStore({
    file: typeof config.file === 'string' && config.file !== '' ? config.file : undefined,
    logger,
  });

  ctx.effect(
    () => ctx.systemPrompt.section({
      name: 'dsh-lang-switch:languages',
      order: 3400,
      interpolate: false,
      text: () => buildPromptLines(store.read()),
    }),
    'dsh-lang-switch: language section',
  );

  registerLangRoutes(ctx, { store });
  registerSwitchTool(ctx, store);

  logger?.info?.(`dsh-lang-switch: 已加载，支持 ${LANGUAGES.length} 种语言`);
}

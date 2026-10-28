/**
 * Agent-facing half of the switch.
 *
 * Same operation as the settings page: `store.write` is the single place the
 * choice is persisted, so the tool and the page cannot disagree.
 */

import { LANGUAGES, labelOf } from './languages.js';
import { describeState } from './prompt.js';

const LANGUAGE_IDS = LANGUAGES.map((language) => language.id);

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {import('./store.js').LangStore} store
 */
export function registerSwitchTool(ctx, store) {
  ctx.effect(
    () => ctx.tools.register({
      name: 'lang_switch',
      description:
        'Read or change the language used for thinking and for the final response.'
        + ' Call with no arguments to read the current setting. Pass `thinking` and/or `response` to change it:'
        + ` the value is a language id (${LANGUAGE_IDS.join(', ')}), "auto" to follow the language of`
        + ' the user’s message, or "default" to leave it unspecified.'
        + ' Change it only when the user asks for it; do not switch on your own initiative.',
      parameters: {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['sync', 'separate'],
            description: '"sync" makes thinking follow the response language; "separate" lets the two differ.',
          },
          thinking: {
            type: 'string',
            description: 'Language id for thinking, or "auto" / "default".',
          },
          response: {
            type: 'string',
            description: 'Language id for the final response, or "auto" / "default".',
          },
          enforce: {
            type: 'boolean',
            description: 'false disables the language instruction entirely.',
          },
        },
        additionalProperties: false,
      },
      output: {
        schema: {
          type: 'object',
          properties: {
            mode: { type: 'string' },
            thinking: { type: 'string' },
            response: { type: 'string' },
            enforce: { type: 'boolean' },
            summary: { type: 'string' },
          },
          required: ['mode', 'thinking', 'response', 'enforce', 'summary'],
          additionalProperties: false,
        },
        render: (_args, result) => [{ type: 'text', text: String(result.summary ?? '') }],
      },
      async execute(args) {
        const source = args !== null && typeof args === 'object' ? args : {};
        const patch = {};
        for (const key of ['mode', 'thinking', 'response', 'enforce']) {
          if (source[key] !== undefined && source[key] !== null) patch[key] = source[key];
        }
        const changed = Object.keys(patch).length > 0;
        const state = changed ? store.write(patch) : store.read();
        const effectiveThinking = state.mode === 'sync' ? state.response : state.thinking;
        const summary = state.enforce
          ? `语言设置：${describeState(state, 'zh')}；`
            + `thinking=${labelOf(effectiveThinking, 'zh')}，`
            + `response=${labelOf(state.response, 'zh')}，mode=${state.mode}。`
          : '语言指令当前已关闭（enforce: false），由模型自行决定语言。';
        return {
          mode: state.mode,
          thinking: state.thinking,
          response: state.response,
          enforce: state.enforce,
          summary: changed ? `已更新。${summary}` : summary,
        };
      },
    }),
    'dsh-lang-switch: lang_switch tool',
  );
}

/**
 * Durable plugin state.
 *
 * The choice is a property of this machine's profile, not of one session, so it
 * lives in a small JSON file instead of the session log. Reads are cheap and
 * tolerant: a missing or damaged file yields the defaults, and only writes go
 * through an atomic rename.
 */

import { readFileSync, mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';

import { DEFAULTS, normalizeChoice, normalizeMode } from './languages.js';

const FILE_NAME = 'lang-switch.json';

/**
 * Profile directory the Host runs in, which is also where this plugin's state
 * file lives next to the other profile data.
 * @returns {string}
 */
function defaultFile() {
  const profileDir = process.env.DSH_PROFILE_DIR;
  if (typeof profileDir === 'string' && profileDir !== '') return join(profileDir, FILE_NAME);
  const dshHome = process.env.DSH_HOME;
  if (typeof dshHome === 'string' && dshHome !== '') return join(dshHome, FILE_NAME);
  return join(homedir(), '.dsh', FILE_NAME);
}

/**
 * @typedef {{ mode: 'sync' | 'separate', thinking: string, response: string, enforce: boolean }} LangState
 */

/** @param {unknown} raw @returns {LangState} */
export function normalizeState(raw) {
  const source = raw !== null && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return {
    mode: normalizeMode(source.mode),
    thinking: normalizeChoice(source.thinking, DEFAULTS.thinking),
    response: normalizeChoice(source.response, DEFAULTS.response),
    enforce: source.enforce === false ? false : true,
  };
}

export class LangStore {
  /** @param {{ file?: string, logger?: { warn?: (message: string) => void } }} [options] */
  constructor(options = {}) {
    this.file = typeof options.file === 'string' && options.file !== '' ? options.file : defaultFile();
    this.logger = options.logger;
    /** @type {LangState | undefined} */
    this.state = undefined;
  }

  /**
   * Current value; the file is re-read only when nothing is cached, so edits
   * made outside the UI are picked up after a Host restart.
   * @returns {LangState}
   */
  read() {
    if (this.state !== undefined) return { ...this.state };
    this.state = this.#load();
    return { ...this.state };
  }

  /** @returns {LangState} */
  #load() {
    let text;
    try {
      text = readFileSync(this.file, 'utf8');
    } catch (error) {
      const code = /** @type {{ code?: string }} */ (error)?.code;
      if (code !== 'ENOENT') this.logger?.warn?.(`dsh-lang-switch: 读取 ${this.file} 失败：${String(error)}`);
      return normalizeState(undefined);
    }
    try {
      return normalizeState(JSON.parse(text));
    } catch {
      this.logger?.warn?.(`dsh-lang-switch: ${this.file} 不是合法 JSON，已回退默认值`);
      return normalizeState(undefined);
    }
  }

  /**
   * Merge a partial patch, persist it, and return the settled state.
   * @param {Partial<LangState>} patch
   * @returns {LangState}
   */
  write(patch) {
    const current = this.read();
    const merged = { ...current, ...patch };
    // Switching into `separate` should not resurrect a stale `thinking` value
    // that has been hidden behind sync mode: seed it from what was in effect.
    if (patch?.mode === 'separate' && current.mode === 'sync' && patch.thinking === undefined) {
      merged.thinking = current.response;
    }
    // Likewise, switching back into `sync` means `thinking` now follows
    // `response`, so keep the two consistent on disk.
    if (merged.mode === 'sync') merged.thinking = merged.response;
    const next = normalizeState(merged);
    const body = `${JSON.stringify({ version: 1, ...next }, null, 2)}\n`;
    try {
      mkdirSync(dirname(this.file), { recursive: true });
      const temporary = `${this.file}.${randomUUID()}.tmp`;
      writeFileSync(temporary, body, 'utf8');
      renameSync(temporary, this.file);
    } catch (error) {
      this.logger?.warn?.(`dsh-lang-switch: 写入 ${this.file} 失败：${String(error)}`);
      throw new Error(`无法保存语言设置：${String(error)}`);
    }
    this.state = { ...next };
    return { ...next };
  }
}

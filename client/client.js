/**
 * dsh-lang-switch settings page.
 *
 * Plain `window.__ModuleLoader__` bundle: React comes from the host page
 * through `require`, so this file needs no build step.
 */

window.__ModuleLoader__.load({
  id: 'dsh-lang-switch',
  factory(require) {
    const React = require('react');
    const { useCallback, useEffect, useMemo, useState } = React;

    const NS = 'dsh-lang-switch';
    const ROUTE = '/dsh-lang';

    const zh = {
      nav: '语言',
      title: '思考与响应语言',
      hint: '分别设置模型思考过程与最终回复所用的语言。修改立即生效，下一条消息就会使用新设置。',
      enabled: '在系统提示中启用语言指令',
      enabledHint: '关闭后不再约束语言，由模型自行决定。',
      mode: '模式',
      modeSync: '同步',
      modeSyncHint: '思考语言与回复语言保持一致（思考跟随回复）。',
      modeSeparate: '分别设置',
      modeSeparateHint: '思考与回复可以使用不同的语言。',
      thinking: '思考语言',
      response: '响应语言',
      thinkingHint: '模型推理、中间分析所用的语言。',
      responseHint: '最终回复给用户的内容所用的语言。',
      auto: '跟随用户',
      last: '模型默认',
      syncedHint: '当前为同步模式，思考语言会跟随响应语言。',
      preview: '生效效果',
      previewText: (thinking, response) => `思考使用${thinking}，回复使用${response}。`,
      saved: '已保存',
      saving: '保存中…',
      loadFailed: '读取设置失败',
      saveFailed: '保存失败',
      retry: '重试',
      unavailable: '无法连接宿主服务，请确认插件已加载。',
    };

    const en = {
      nav: 'Language',
      title: 'Thinking & response language',
      hint: 'Set the language used for the model’s reasoning and for its reply. Changes apply to the very next message.',
      enabled: 'Enable the language instruction in the system prompt',
      enabledHint: 'When off, nothing is imposed and the model decides.',
      mode: 'Mode',
      modeSync: 'Sync',
      modeSyncHint: 'Thinking follows the response language.',
      modeSeparate: 'Separate',
      modeSeparateHint: 'Thinking and the response may use different languages.',
      thinking: 'Thinking language',
      response: 'Response language',
      thinkingHint: 'Language of the reasoning and intermediate analysis.',
      responseHint: 'Language of what the user finally reads.',
      auto: 'Follow the user',
      last: 'Model default',
      syncedHint: 'Sync mode is on, so thinking follows the response language.',
      preview: 'In effect',
      previewText: (thinking, response) => `thinking in ${thinking}, replying in ${response}.`,
      saved: 'Saved',
      saving: 'Saving…',
      loadFailed: 'Could not load the setting',
      saveFailed: 'Could not save',
      retry: 'Retry',
      unavailable: 'Host service unreachable — check that the plugin is loaded.',
    };

    const CSS = `.dsh-lang{
  --r-border:var(--dsw-alias-border-l1,#e5e6eb);
  --r-border-strong:var(--dsw-alias-border-l2,#c9cdd4);
  --r-hover:var(--dsw-alias-interactive-bg-hover,rgba(31,35,41,.05));
  --r-bg:var(--dsw-alias-bg-layer-1,#fff);
  --r-text:var(--dsw-alias-label-primary,#1f2329);
  --r-secondary:var(--dsw-alias-label-secondary,#646a73);
  --r-muted:var(--dsw-alias-label-tertiary,#8f959e);
  --r-accent:var(--dsw-alias-button-info-fill,#4d6bfe);
  --r-danger:var(--dsw-alias-state-error-primary,#d92d20);
  max-width:720px;margin:0 auto;color:var(--r-text);font-size:13px;line-height:1.6;
}
.dsh-lang__page{height:100%;overflow:auto;padding:30px 38px 56px;box-sizing:border-box;background:transparent}
.dsh-lang__title{font-size:16px;font-weight:600;margin:0 0 4px}
.dsh-lang__hint{color:var(--r-secondary);font-size:12px;margin:0 0 18px}
.dsh-lang__row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid var(--r-border)}
.dsh-lang__row:last-child{border-bottom:none}
.dsh-lang__label{font-size:13px;font-weight:500}
.dsh-lang__note{color:var(--r-muted);font-size:12px;margin-top:2px}
.dsh-lang__control{flex:none;min-width:190px;display:flex;justify-content:flex-end}
.dsh-lang select{width:100%;box-sizing:border-box;font:inherit;color:inherit;background:var(--r-bg);border:1px solid var(--r-border);border-radius:9px;padding:6px 10px;outline:none}
.dsh-lang select:focus{border-color:var(--r-accent);box-shadow:0 0 0 3px rgba(77,107,254,.14)}
.dsh-lang select:disabled{opacity:.5;cursor:not-allowed}
.dsh-lang__seg{display:inline-flex;border:1px solid var(--r-border);border-radius:9px;overflow:hidden}
.dsh-lang__seg button{font:inherit;color:var(--r-secondary);background:transparent;border:none;padding:6px 14px;cursor:pointer}
.dsh-lang__seg button.on{background:var(--r-accent);color:#fff}
.dsh-lang__seg button:not(.on):hover{background:var(--r-hover);color:var(--r-text)}
.dsh-lang__switch{position:relative;width:38px;height:22px;flex:none}
.dsh-lang__switch input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer}
.dsh-lang__track{display:block;width:38px;height:22px;border-radius:11px;background:var(--r-border-strong);transition:background .15s}
.dsh-lang__track::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .15s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.dsh-lang__switch input:checked + .dsh-lang__track{background:var(--r-accent)}
.dsh-lang__switch input:checked + .dsh-lang__track::after{transform:translateX(16px)}
.dsh-lang__switch input:focus-visible + .dsh-lang__track{box-shadow:0 0 0 3px rgba(77,107,254,.2)}
.dsh-lang__preview{margin-top:16px;border-radius:10px;padding:10px 14px;background:var(--r-hover);font-size:12px;color:var(--r-secondary)}
.dsh-lang__preview b{color:var(--r-text);font-weight:600}
.dsh-lang__status{margin-top:10px;font-size:12px;color:var(--r-muted);min-height:18px}
.dsh-lang__status.error{color:var(--r-danger)}
.dsh-lang__error{border-radius:9px;padding:9px 12px;margin:0 0 12px;font-size:12px;background:rgba(217,45,32,.07);border:1px solid rgba(217,45,32,.16);color:var(--r-danger)}
@media (max-width:640px){
  .dsh-lang__page{padding:20px 18px 40px}
  .dsh-lang__row{flex-direction:column;gap:8px}
  .dsh-lang__control{width:100%;justify-content:flex-start}
}
`;

    function injectCss() {
      if (document.querySelector('style[data-plugin-css="dsh-lang-switch"]') !== null) return;
      const style = document.createElement('style');
      style.setAttribute('data-plugin-css', 'dsh-lang-switch');
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    async function request(path, options = {}) {
      const response = await fetch(`${ROUTE}${path}`, {
        ...options,
        headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
      });
      let data;
      try {
        data = await response.json();
      } catch {
        data = undefined;
      }
      if (!response.ok) {
        const detail = data && typeof data.detail === 'string' ? data.detail : `HTTP ${response.status}`;
        throw new Error(detail);
      }
      return data;
    }

    function labelOf(language, sentinel, t) {
      if (sentinel === 'auto') return t('auto');
      if (sentinel === 'default') return t('last');
      if (language === undefined) return sentinel;
      return language.native;
    }

    function LanguageSelect(props) {
      const { id, value, languages, disabled, onChange, t } = props;
      return React.createElement('select', {
        id,
        value,
        disabled,
        onChange: (event) => onChange(event.target.value),
      }, [
        React.createElement('option', { key: 'list', value: '', disabled: true }, '—'),
        React.createElement('option', { key: 'auto', value: 'auto' }, t('auto')),
        React.createElement('option', { key: 'default', value: 'default' }, t('last')),
        ...languages.map((language) => React.createElement('option', { key: language.id, value: language.id }, language.native)),
      ]);
    }

    function LangSwitchPage(props) {
      const { t } = props;
      injectCss();
      const [state, setState] = useState(null);
      const [languages, setLanguages] = useState([]);
      const [loading, setLoading] = useState(true);
      const [busy, setBusy] = useState(false);
      const [error, setError] = useState('');
      const [status, setStatus] = useState('');

      const load = useCallback(async () => {
        setLoading(true);
        try {
          const data = await request('/state');
          setState(data.state);
          setLanguages(Array.isArray(data.languages) ? data.languages : []);
          setError('');
        } catch (failure) {
          setError(`${t('loadFailed')}：${failure.message}`);
        } finally {
          setLoading(false);
        }
      }, [t]);

      useEffect(() => {
        load();
      }, [load]);

      const save = useCallback(async (patch) => {
        setBusy(true);
        setStatus(t('saving'));
        try {
          const data = await request('/state', { method: 'POST', body: JSON.stringify(patch) });
          setState(data.state);
          setStatus(t('saved'));
          setError('');
        } catch (failure) {
          setStatus('');
          setError(`${t('saveFailed')}：${failure.message}`);
        } finally {
          setBusy(false);
        }
      }, [t]);

      const byId = useMemo(() => {
        const map = new Map();
        for (const language of languages) map.set(language.id, language);
        return map;
      }, [languages]);

      if (loading && state === null) {
        return React.createElement('div', { className: 'dsh-lang__page' }, React.createElement('div', { className: 'dsh-lang' },
          React.createElement('p', { className: 'dsh-lang__hint' }, '…')));
      }

      if (state === null) {
        return React.createElement('div', { className: 'dsh-lang__page' }, React.createElement('div', { className: 'dsh-lang' },
          React.createElement('p', { className: 'dsh-lang__error' }, error || t('unavailable')),
          React.createElement('button', { type: 'button', onClick: load }, t('retry'))));
      }

      const effectiveThinking = state.mode === 'sync' ? state.response : state.thinking;
      const syncMode = state.mode === 'sync';
      const disabled = busy || state.enforce === false;

      return React.createElement('div', { className: 'dsh-lang__page' }, React.createElement('div', { className: 'dsh-lang' },
        React.createElement('h2', { className: 'dsh-lang__title' }, t('title')),
        React.createElement('p', { className: 'dsh-lang__hint' }, t('hint')),
        error ? React.createElement('p', { className: 'dsh-lang__error' }, error) : null,

        React.createElement('div', { className: 'dsh-lang__row' },
          React.createElement('div', null,
            React.createElement('div', { className: 'dsh-lang__label' }, t('enabled')),
            React.createElement('div', { className: 'dsh-lang__note' }, t('enabledHint'))),
          React.createElement('div', { className: 'dsh-lang__control' },
            React.createElement('label', { className: 'dsh-lang__switch' },
              React.createElement('input', {
                type: 'checkbox',
                checked: state.enforce !== false,
                disabled: busy,
                'aria-label': t('enabled'),
                onChange: (event) => save({ enforce: event.target.checked }),
              }),
              React.createElement('span', { className: 'dsh-lang__track' })))),

        React.createElement('div', { className: 'dsh-lang__row' },
          React.createElement('div', null,
            React.createElement('div', { className: 'dsh-lang__label' }, t('mode')),
            React.createElement('div', { className: 'dsh-lang__note' }, syncMode ? t('modeSyncHint') : t('modeSeparateHint'))),
          React.createElement('div', { className: 'dsh-lang__control' },
            React.createElement('div', { className: 'dsh-lang__seg' },
              ['sync', 'separate'].map((value) => React.createElement('button', {
                key: value,
                type: 'button',
                className: state.mode === value ? 'on' : '',
                disabled: busy,
                onClick: () => state.mode !== value && save({ mode: value }),
              }, t(value === 'sync' ? 'modeSync' : 'modeSeparate')))))),

        React.createElement('div', { className: 'dsh-lang__row' },
          React.createElement('div', null,
            React.createElement('div', { className: 'dsh-lang__label' }, t('thinking')),
            React.createElement('div', { className: 'dsh-lang__note' }, syncMode ? t('syncedHint') : t('thinkingHint'))),
          React.createElement('div', { className: 'dsh-lang__control' },
            React.createElement('label', { htmlFor: 'dsh-lang-thinking', style: { display: 'none' } }, t('thinking')),
            React.createElement(LanguageSelect, {
              id: 'dsh-lang-thinking',
              value: syncMode ? state.response : state.thinking,
              languages,
              disabled,
              t,
              onChange: (value) => save(syncMode ? { response: value } : { thinking: value }),
            }))),

        React.createElement('div', { className: 'dsh-lang__row' },
          React.createElement('div', null,
            React.createElement('div', { className: 'dsh-lang__label' }, t('response')),
            React.createElement('div', { className: 'dsh-lang__note' }, t('responseHint'))),
          React.createElement('div', { className: 'dsh-lang__control' },
            React.createElement(LanguageSelect, {
              id: 'dsh-lang-response',
              value: state.response,
              languages,
              disabled,
              t,
              onChange: (value) => save({ response: value }),
            }))),

        React.createElement('div', { className: 'dsh-lang__preview' },
          React.createElement('b', null, `${t('preview')}：`),
          t('previewText')(labelOf(byId.get(effectiveThinking), effectiveThinking, t), labelOf(byId.get(state.response), state.response, t))),

        React.createElement('div', { className: 'dsh-lang__status' }, busy ? t('saving') : status)));
    }

    return {
      name: NS,
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-lang-switch: dictionaries');
        const t = ctx.locale.bind(NS);

        ctx.slots.inject('settings.section', function* () {
          yield ctx.slots.register({
            name: 'settings.section',
            id: 'lang-switch',
            order: 36,
            label: () => t('nav'),
            inject: () => ({ t }),
          }, LangSwitchPage);
        });
      },
    };
  },
});

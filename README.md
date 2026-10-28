# dsh-lang-switch · 思考与响应语言

分别设置模型**思考过程**和**最终回复**使用的语言。

默认：**思考英文，回复中文**。

## 功能

- 支持 9 种常用语言：简体中文、英语、日语、韩语、法语、德语、西班牙语、葡萄牙语、俄语。
- 两种模式：
  - **同步**（默认）：思考语言跟随回复语言，只设一个即可。
  - **分别设置**：思考与回复可以各用不同语言（例如思考英文、回复中文）。
- 每个位置还可以选 `跟随用户`（自动匹配你提问所用的语言）或 `模型默认`（不做限制）。
- 总开关 `在系统提示中启用语言指令`：关掉后完全不干预模型。
- 设置改动**下一条消息**立即生效，无需重启。

## 在哪里改

1. **设置页**：`设置 → 语言`（侧边栏设置分区，标题「思考与响应语言」）。
2. **让 Agent 改**：工具 `lang_switch`，例如「把你的思考语言改成英文」，或「思考和回复都用日语」。

两条路径走同一份 Host 实现（`store.write`），不会出现两边不一致。

## 实现要点

| 文件 | 作用 |
| --- | --- |
| `src/index.js` | Host 入口，注册系统提示段、HTTP 路由、`lang_switch` 工具 |
| `src/languages.js` | 语言表与默认值 |
| `src/store.js` | 状态持久化（原子写入） |
| `src/prompt.js` | 生成系统提示中的 `<language>` 段 |
| `src/routes.js` | `/dsh-lang/state` 的 GET/POST |
| `src/tools.js` | `lang_switch` 工具 |
| `client/client.js` | `__ModuleLoader__` 客户端页面，无需构建 |

状态文件：`$DSH_PROFILE_DIR/lang-switch.json`（无该变量时回退到 `$DSH_HOME`、`~/.dsh`）。初始内容：

```json
{
  "version": 1,
  "mode": "sync",
  "thinking": "en",
  "response": "zh",
  "enforce": true
}
```

注意：`sync` 模式下以 `response` 为准，`thinking` 仅作为分离模式的值保留。

## 安装

```bash
git clone https://github.com/iemgnod/dsh-lang-switch.git
# 然后在 DSH 的插件管理里选择「安装本地目录」，指向克隆下来的目录
```

## 已知限制

- 「思考语言」是**软约束**。语言指令写在 system prompt 里，模型多数时候遵守，但在英文代码、英文工具输出较多的上下文里可能漂回英文。回复语言基本稳定。
- 状态文件按 profile 隔离，但当前实现在 `DSH_PROFILE_DIR` 未生效时会回退到 `$DSH_HOME`，因此实际路径可能是 `~/.dsh/lang-switch.json`。修改前先看一眼页面顶部显示的路径。


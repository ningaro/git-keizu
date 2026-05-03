# テスト観点表: web/i18n.ts

> Source: `web/i18n.ts`
> Generated: 2026-05-03T00:00:00Z
> Language: TypeScript
> Test Framework: Vitest

## S1: webview t() helper fallback and placeholder handling

> Origin: Feature 035 (japanese-ui-i18n) Task 8
> Added: 2026-05-03
> Status: active
> Supersedes: -
> Signature: `t(key: string, ...args: (string | number)[]): string; getWebviewLocale(): "en" | "ja"`
> Target Path: `web/i18n.ts`

| Case ID | Input / Precondition                      | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                | Notes                     |
| ------- | ----------------------------------------- | -------------------------------------------------------------------------- | ------------------------------ | ------------------------- |
| TC-001  | 辞書に key があり `{0}` / `{1}` を含む    | Normal - key hit                                                           | placeholder が順番に置換される | 主要正常系                |
| TC-002  | 辞書に key がない                         | Boundary - key miss                                                        | key 自体を返す                 | 欠損キー fallback         |
| TC-003  | placeholder の引数が不足                  | Boundary - missing arg                                                     | 不足引数は空文字になる         | VS Code l10n との互換方針 |
| TC-004  | `globalThis.webviewMessages` 未定義       | Exception - missing global                                                 | 空辞書扱いで key fallback する | 単体テスト / 注入失敗時   |
| TC-005  | `globalThis.webviewLocale` が `ja` / `en` | Normal - locale normalize                                                  | `ja` のみ ja、それ以外は en    | 日付 locale 分岐の入口    |

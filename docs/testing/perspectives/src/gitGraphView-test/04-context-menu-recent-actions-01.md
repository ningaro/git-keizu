# テスト観点表: src/gitGraphView.ts

> Source: `src/gitGraphView.ts`
> Generated: 2026-05-02T14:08:00Z
> Language: TypeScript
> Test Framework: Vitest
> Responsibility: context-menu-recent-actions

## S19: viewState showRecentActions の受け渡し

> Origin: Feature 034 (context-menu-recent-actions) Task 1
> Added: 2026-05-02
> Status: active
> Supersedes: -
> Signature: `private getHtmlForWebview()`
> Target Path: `src/gitGraphView.ts`

| Case ID | Input / Precondition         | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                                                               | Notes                |
| ------- | ---------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------- |
| TC-065  | `getHtmlForWebview()` 呼び出し | Normal - standard                                                          | 生成 HTML 内の `viewState.showRecentActions` が `Config.showRecentActions()` の返却値 `true` と一致する | 設定パイプライン検証 |

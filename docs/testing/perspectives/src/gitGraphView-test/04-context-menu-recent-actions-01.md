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

| Case ID | Input / Precondition           | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                                                                                         | Notes                |
| ------- | ------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------- |
| TC-065  | `getHtmlForWebview()` 呼び出し | Normal - standard                                                          | 生成 HTML 内の `viewState.showRecentActions` が `Config.showRecentActions()` の返却値 `true` と一致する | 設定パイプライン検証 |

## S20: notifyShowRecentActionsChanged() runtime 同期

> Origin: Feature 039 (show-recent-actions-runtime-sync) (light-spec-plan)
> Added: 2026-05-10
> Status: active
> Supersedes: -
> Signature: `public notifyShowRecentActionsChanged()`
> Target Path: `src/gitGraphView.ts`

| Case ID | Input / Precondition                                                                                                       | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                                                                                                                                                                      | Notes                                |
| ------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| TC-066  | `getConfig().showRecentActions()` が `true` を返す状態で `GitKeizuView` を生成し `notifyShowRecentActionsChanged()` を呼ぶ | Normal - standard                                                          | `panel.webview.postMessage` が `{ command: "setShowRecentActions", showRecentActions: true }` で 1 回呼ばれる。`update()`、`panel.webview.html` 再代入、`refresh` 系送信は発生しない | runtime sync 経路（HTML 再生成なし） |
| TC-067  | `getConfig().showRecentActions()` が `false` を返す状態で `notifyShowRecentActionsChanged()` を呼ぶ                        | Boundary - false setting                                                   | `panel.webview.postMessage` が `{ command: "setShowRecentActions", showRecentActions: false }` で 1 回呼ばれる                                                                       | 非表示への切り替えも同経路で同期     |

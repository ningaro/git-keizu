# テスト観点表: src/gitGraphView.ts

> Source: `src/gitGraphView.ts`
> Generated: 2026-05-02T01:45:44Z
> Language: TypeScript
> Test Framework: Vitest
> Responsibility: state-lifecycle

## S6: createOrShow() rootUri ハンドリング

> Origin: Feature 005 (webview-ux-enhancements) (aidd-spec-tasks-test)
> Added: 2026-02-27
> Status: active
> Supersedes: -

**テスト対象パス**: `src/gitGraphView.ts`

| Case ID | Input / Precondition                             | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                                                        | Notes          |
| ------- | ------------------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------- |
| TC-015  | rootUri 指定あり、パネル未作成                   | Normal - new panel                                                         | viewState.lastActiveRepo が rootUri.fsPath に設定される                | 初回起動時     |
| TC-016  | rootUri 指定あり、パネル既存、リポジトリ登録済み | Normal - existing panel                                                    | panel.reveal() 後に ResponseSelectRepo が送信される                    | リポジトリ切替 |
| TC-017  | rootUri 指定あり、パネル既存、リポジトリ未登録   | Normal - unregistered                                                      | registerRepoFromUri() が呼ばれ、その後 ResponseSelectRepo が送信される | 新規登録フロー |
| TC-018  | rootUri 指定なし（コマンドパレットから実行）     | Normal - no rootUri                                                        | 従来動作維持（selectRepo メッセージ送信なし）                          | 後方互換       |

## S7: viewState キーバインド・自動読み込み設定の受け渡し

> Origin: Feature 005 (webview-ux-enhancements) (aidd-spec-tasks-test)
> Added: 2026-02-27
> Status: active
> Supersedes: -

**テスト対象パス**: `src/gitGraphView.ts`

| Case ID | Input / Precondition         | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                                      | Notes                |
| ------- | ---------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------- |
| TC-019  | getHtmlForWebview() 呼び出し | Normal - standard                                                          | viewState に keybindings オブジェクトが含まれる      | 設定パイプライン検証 |
| TC-020  | getHtmlForWebview() 呼び出し | Normal - standard                                                          | viewState に loadMoreCommitsAutomatically が含まれる | 設定パイプライン検証 |

## S12: loadCommits branches/authors 配列パススルー

> Origin: Feature 012 (ui-enhancements) (aidd-spec-tasks-test)
> Added: 2026-03-07
> Status: active
> Supersedes: -

**テスト対象パス**: `src/gitGraphView.ts:279-291`

| Case ID | Input / Precondition                               | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                                                     | Notes          |
| ------- | -------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------- |
| TC-037  | msg.branches=["main","dev"], msg.authors=["Alice"] | Normal - standard                                                          | getCommits が branches=["main","dev"], authors=["Alice"] で呼ばれる | 配列パススルー |
| TC-038  | msg.branches=[], msg.authors=[]                    | Boundary - empty arrays                                                    | getCommits が branches=[], authors=[] で呼ばれる（全件表示）        | 空配列         |

## S14: viewState commitOrdering 受け渡し / loadCommits ハンドラ

> Origin: Feature 015 (commit-sort-order) (aidd-spec-tasks-test)
> Added: 2026-03-10
> Status: active
> Supersedes: -

**テスト対象パス**: `src/gitGraphView.ts`

| Case ID | Input / Precondition                                  | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                                                                  | Notes                |
| ------- | ----------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------- |
| TC-044  | getHtmlForWebview() 呼び出し                          | Normal - standard                                                          | viewState に commitOrdering が含まれ、Config.commitOrdering() の返却値と一致する | 設定パイプライン検証 |
| TC-045  | loadCommits メッセージに commitOrdering="topo"        | Normal - standard                                                          | dataSource.getCommits() に commitOrdering="topo" が渡される                      | -                    |
| TC-046  | loadCommits メッセージに commitOrdering="author-date" | Normal - standard                                                          | dataSource.getCommits() に commitOrdering="author-date" が渡される               | -                    |
| TC-047  | loadCommits メッセージに commitOrdering="date"        | Normal - default                                                           | dataSource.getCommits() に commitOrdering="date" が渡される                      | デフォルト動作確認   |

## S17: CSS_COLOR_VAR_PREFIX 定数による変数生成

> Origin: Feature 020 (legacy-branding-cleanup) (aidd-spec-tasks-test)
> Added: 2026-03-20
> Status: active
> Supersedes: -

**シグネチャ**: `private getHtmlForWebview(uri: vscode.Uri): string`
**テスト対象パス**: `src/gitGraphView.ts:553-560`

| Case ID | Input / Precondition                                | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                                                                  | Notes                       |
| ------- | --------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------- |
| TC-059  | getHtmlForWebview() 呼び出し、graphColours に色あり | Normal - standard                                                          | 生成 HTML の style 属性に `--git-keizu-color` プレフィックスの変数定義が含まれる | CSS 定数リネーム検証        |
| TC-060  | getHtmlForWebview() 呼び出し、graphColours に色あり | Normal - standard                                                          | 生成 HTML の data-color セレクタに `var(--git-keizu-color` の変数参照が含まれる  | 定義-参照チェーン一致の検証 |

## S18: loadBranches watcher 起動オーケストレーション

> Origin: Feature 033 (watch-refresh-scope) Task 3
> Added: 2026-05-02T01:45:44Z
> Status: active
> Supersedes: -
> Signature: `loadBranches`
> Target Path: `src/gitGraphView.ts`

| Case ID | Input / Precondition                                             | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                                                                                                                                                                           | Notes                       |
| ------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| TC-061  | `loadBranches` を新規 repo で受信、`getBranches.error=false`     | Normal - repo change                                                       | `dataSource.getRepositoryStateWatchPaths(repo)` が1回呼ばれ、その戻り値配列で `repoFileWatcher.start(...)` が1回呼ばれる。あわせて `extensionState.setLastActiveRepo(repo)` が1回呼ばれる | repo 切替                   |
| TC-062  | 同一 repo で `loadBranches` を連続受信                           | Boundary - same repo                                                       | `getBranches` は再実行されるが、`getRepositoryStateWatchPaths` と `repoFileWatcher.start` は追加で呼ばれない                                                                              | 不要再起動抑止              |
| TC-063  | `getBranches.error=true`, `isGitRepository=false`, repo 切替あり | External - branch load failure                                             | `isGitRepository(repo)` が1回呼ばれ、`loadBranches` 応答の `isRepo` が `false` になりつつ、watch root 解決結果で `repoFileWatcher.start(...)` が1回呼ばれる                               | error 分岐でも watcher 起動 |
| TC-064  | panel.visible が `true -> false` に変化                          | Normal - hidden panel stop                                                 | view state handler 実行後に `repoFileWatcher.stop()` が1回呼ばれる                                                                                                                        | 非表示時停止維持            |

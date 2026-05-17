# テスト観点表: src/config.ts

> Source: `src/config.ts`
> Generated: 2026-05-17T00:00:00Z
> Language: TypeScript
> Test Framework: Vitest
> Responsibility: defaults-schema

## S10: Config fallback defaults vs package.json — 単純値比較（24設定）

> Origin: Feature 021 (loadMoreCommits-default-mismatch) (aidd-spec-tasks-test)
> Added: 2026-03-21
> Status: active
> Supersedes: -

**テスト対象パス**: `src/config.ts`（全 getter メソッド）
**テストファイル**: `tests/src/config-defaults.test.ts`

各 Config メソッドの fallback 値（モックが fallback を返す状態）が `package.json` の `contributes.configuration.properties` のデフォルト値と一致することを検証する。

| Case ID | Input / Precondition                                              | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                   | Notes            |
| ------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------- | ---------------- |
| TC-042  | dateFormat fallback                                               | Normal - cross-check                                                       | package.json default と一致       | string 型        |
| TC-043  | dateType fallback                                                 | Normal - cross-check                                                       | package.json default と一致       | string 型        |
| TC-044  | fetchAvatars fallback                                             | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-045  | graphStyle fallback                                               | Normal - cross-check                                                       | package.json default と一致       | string 型        |
| TC-046  | initialLoadCommits fallback                                       | Normal - cross-check                                                       | package.json default と一致       | number 型        |
| TC-047  | loadMoreCommits fallback                                          | Normal - cross-check                                                       | package.json default (100) と一致 | REQ-9.1 修正対象 |
| TC-048  | loadMoreCommitsAutomatically fallback                             | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-049  | maxDepthOfRepoSearch fallback                                     | Normal - cross-check                                                       | package.json default と一致       | number 型        |
| TC-050  | showCurrentBranchByDefault fallback                               | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-051  | showStatusBarItem fallback                                        | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-052  | showUncommittedChanges fallback                                   | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-053  | tabIconColourTheme fallback                                       | Normal - cross-check                                                       | package.json default と一致       | string 型        |
| TC-054  | sourceCodeProviderIntegrationLocation fallback                    | Normal - cross-check                                                       | package.json default と一致       | string 型        |
| TC-055  | repository.commits.order fallback                                 | Normal - cross-check                                                       | package.json default と一致       | string 型        |
| TC-056  | repository.commits.mute.mergeCommits fallback                     | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-057  | repository.commits.mute.commitsThatAreNotAncestorsOfHead fallback | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-058  | dialog.merge.noFastForward fallback                               | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-059  | dialog.merge.squashCommits fallback                               | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-060  | dialog.merge.noCommit fallback                                    | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-061  | dialog.cherryPick.recordOrigin fallback                           | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-062  | dialog.cherryPick.noCommit fallback                               | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-063  | dialog.stashUncommittedChanges.includeUntracked fallback          | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-064  | dialog.createWorktree.openTerminal fallback                       | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |
| TC-065  | dialog.removeWorktree.deleteBranch fallback                       | Normal - cross-check                                                       | package.json default と一致       | boolean 型       |

## S11: Config fallback defaults vs package.json — keybinding 変換後比較（4設定）

> Origin: Feature 021 (loadMoreCommits-default-mismatch) (aidd-spec-tasks-test)
> Added: 2026-03-21
> Status: active
> Supersedes: -

**テスト対象パス**: `src/config.ts`（keyboardShortcut\* メソッド + parseKeybinding）
**テストファイル**: `tests/src/config-defaults.test.ts`

| Case ID | Input / Precondition                                    | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result | Notes                  |
| ------- | ------------------------------------------------------- | -------------------------------------------------------------------------- | --------------- | ---------------------- |
| TC-066  | keyboardShortcutFind fallback ("CTRL/CMD + F")          | Normal - cross-check + transform                                           | "f" を返す      | parseKeybinding 変換後 |
| TC-067  | keyboardShortcutRefresh fallback ("CTRL/CMD + R")       | Normal - cross-check + transform                                           | "r" を返す      | parseKeybinding 変換後 |
| TC-068  | keyboardShortcutScrollToHead fallback ("CTRL/CMD + H")  | Normal - cross-check + transform                                           | "h" を返す      | parseKeybinding 変換後 |
| TC-069  | keyboardShortcutScrollToStash fallback ("CTRL/CMD + S") | Normal - cross-check + transform                                           | "s" を返す      | parseKeybinding 変換後 |

## S12: Config fallback defaults vs package.json — graphColours filter 後比較

> Origin: Feature 021 (loadMoreCommits-default-mismatch) (aidd-spec-tasks-test)
> Added: 2026-03-21
> Status: active
> Supersedes: -

**テスト対象パス**: `src/config.ts`（graphColours メソッド）
**テストファイル**: `tests/src/config-defaults.test.ts`

| Case ID | Input / Precondition              | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                                    | Notes                               |
| ------- | --------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------- |
| TC-070  | graphColours fallback（12色配列） | Normal - cross-check + filter                                              | package.json default の12色配列と一致（deepEqual） | REQ-9.2 修正対象。filter は全色通過 |

## S13: openNewTabEditorGroup() エディタグループ設定

> Origin: Feature 026 (commit-detail-open-file) (aidd-spec-tasks-test)
> Added: 2026-04-04
> Status: active
> Supersedes: -

**シグネチャ**: `openNewTabEditorGroup(): vscode.ViewColumn`
**テスト対象パス**: `src/config.ts`

| Case ID | Input / Precondition                             | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                     | Notes                        |
| ------- | ------------------------------------------------ | -------------------------------------------------------------------------- | ----------------------------------- | ---------------------------- |
| TC-071  | openNewTabEditorGroup 設定が未設定               | Normal - default fallback                                                  | vscode.ViewColumn.Active が返される | デフォルト値のフォールバック |
| TC-072  | openNewTabEditorGroup = "Active"                 | Normal - explicit active                                                   | vscode.ViewColumn.Active が返される | 明示的な Active 指定         |
| TC-073  | openNewTabEditorGroup = "Beside"                 | Normal - beside                                                            | vscode.ViewColumn.Beside が返される | 隣のグループ                 |
| TC-074  | openNewTabEditorGroup = "One"                    | Normal - numbered group                                                    | vscode.ViewColumn.One が返される    | 番号指定グループ             |
| TC-075  | openNewTabEditorGroup = "Nine"                   | Boundary - max group                                                       | vscode.ViewColumn.Nine が返される   | 最大グループ番号             |
| TC-076  | openNewTabEditorGroup = "InvalidValue"（不正値） | Validation - invalid value                                                 | vscode.ViewColumn.Active が返される | フォールバック動作           |
| TC-077  | openNewTabEditorGroup fallback comparison        | Normal - cross-check + mapping                                             | package.json default と一致         | VIEW_COLUMN_MAPPING 経由     |

## S14: showRecentActions 設定

> Origin: Feature 034 (context-menu-recent-actions) Task 1
> Added: 2026-05-02
> Status: active
> Supersedes: -
> Signature: `showRecentActions(): boolean`
> Target Path: `src/config.ts`

| Case ID | Input / Precondition                                 | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                                                                                                 | Notes                |
| ------- | ---------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------- |
| TC-078  | `menu.showRecentActions` 設定未指定                  | Normal - default                                                           | `showRecentActions()` が `true` を返す                                                                          | 新規設定のデフォルト |
| TC-079  | `menu.showRecentActions = false`                     | Normal - explicit false                                                    | `showRecentActions()` が `false` を返す                                                                         | 描画のみ OFF         |
| TC-080  | fallback getter と `package.json` default の整合確認 | Normal - cross-check                                                       | `tests/src/config-defaults.test.ts` で `showRecentActions()` の fallback 値が `package.json` default と一致する | static default 整合  |

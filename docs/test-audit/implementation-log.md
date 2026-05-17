# Test Implementation Log

> Generated: 2026-05-17T00:00:00Z
> Test Plans Processed: 3
> Total Tests Generated: 18
> Total Tests Passed: 18
> Total Tests Failed: 0
> Total Tests Skipped: 0

## Summary

| テストプラン                                             | ソースファイル        | テストファイル                   | 生成数 | 成功 | 失敗 | スキップ |
| -------------------------------------------------------- | --------------------- | -------------------------------- | ------ | ---- | ---- | -------- |
| docs/testing/perspectives/src/config-test/INDEX.md       | `src/config.ts`       | `tests/src/config.test.ts`       | 4      | 4    | 0    | 0        |
| docs/testing/perspectives/src/gitGraphView-test/INDEX.md | `src/gitGraphView.ts` | `tests/src/gitGraphView.test.ts` | 6      | 6    | 0    | 0        |
| docs/testing/perspectives/web/main-test/INDEX.md         | `web/main.ts`         | `tests/web/main.test.ts`         | 8      | 8    | 0    | 0        |

## Details

### src/config.ts

**テストプラン**: `docs/testing/perspectives/src/config-test/INDEX.md`
**ソースファイル**: `src/config.ts`
**テストファイル**: `tests/src/config.test.ts`

S1〜S16 (TC-001〜TC-092) は既存テストでカバー済み。本ランでは未実装の S17（`gitPath()`）のみを追記。

| Case ID | テスト名                                                           | 結果 | リトライ数 | 備考                                      |
| ------- | ------------------------------------------------------------------ | ---- | ---------- | ----------------------------------------- |
| TC-093  | returns 'git' when git.path is null (default fallback) (TC-093)    | PASS | 0          | Normal - default fallback                 |
| TC-094  | returns configured git.path as-is (TC-094)                         | PASS | 0          | Normal - configured                       |
| TC-095  | returns empty string when git.path is set to empty string (TC-095) | PASS | 0          | Boundary - empty string (`!== null` only) |
| TC-096  | returns Windows-style git.path as-is (TC-096)                      | PASS | 0          | Normal - cross-platform                   |

### src/gitGraphView.ts

**テストプラン**: `docs/testing/perspectives/src/gitGraphView-test/INDEX.md`
**ソースファイル**: `src/gitGraphView.ts`
**テストファイル**: `tests/src/gitGraphView.test.ts`

S1〜S15 (TC-001〜TC-069) は既存テストでカバー済み。本ランでは未実装の S16 (viewDiff エラーハンドリング) と S17 (未登録リポジトリのメッセージガード) を追記。

| Case ID | テスト名                                                                       | 結果 | リトライ数 | 備考                                                                |
| ------- | ------------------------------------------------------------------------------ | ---- | ---------- | ------------------------------------------------------------------- |
| TC-070  | returns success=false when vscode.diff rejects in compare mode (TC-070)        | PASS | 1          | リトライ理由: UNCOMMITTED_CHANGES_HASH 未 import (`types` から追加) |
| TC-071  | returns success=false when vscode.diff rejects in uncommitted mode (TC-071)    | PASS | 1          | 同上                                                                |
| TC-072  | returns success=false when vscode.diff rejects in normal commit mode (TC-072)  | PASS | 1          | 同上                                                                |
| TC-073  | drops loadCommits messages for an unregistered repo (TC-073)                   | PASS | 0          | Validation - unregistered repo                                      |
| TC-074  | bypasses the guard for copyToClipboard even when repo is unregistered (TC-074) | PASS | 0          | Normal - bypass guard                                               |
| TC-075  | bypasses the guard for loadRepos messages without a repo key (TC-075)          | PASS | 0          | Normal - bypass guard (no repo key)                                 |

### web/main.ts

**テストプラン**: `docs/testing/perspectives/web/main-test/INDEX.md`
**ソースファイル**: `web/main.ts`
**テストファイル**: `tests/web/main.test.ts`

S1〜S39 (TC-001〜TC-220) は既存テストでカバー済み。本ランでは未実装の S40 (`handleEscape()` 優先順位チェーン) を追記。既存 TC-083〜TC-091 で同等のシナリオがカバーされているが、Case ID トレーサビリティのため新規 Case ID で独立テストを追加した。

| Case ID | テスト名                                                                              | 結果 | リトライ数 | 備考                         |
| ------- | ------------------------------------------------------------------------------------- | ---- | ---------- | ---------------------------- |
| TC-221  | hideContextMenu wins as the first priority (TC-221)                                   | PASS | 0          | Normal - first priority      |
| TC-222  | hideDialog wins as the second priority (TC-222)                                       | PASS | 0          | Normal - second priority     |
| TC-223  | repoDropdown.close wins as the third priority (TC-223)                                | PASS | 0          | Normal - third priority      |
| TC-224  | findWidget.close runs when all menus/dialogs/dropdowns are inactive (TC-224)          | PASS | 0          | Normal - findWidget priority |
| TC-225  | hideCommitDetails runs as the final fallback when only expandedCommit is set (TC-225) | PASS | 0          | Normal - last fallback       |
| TC-226  | no-op when no UI components are active and no commit is expanded (TC-226)             | PASS | 0          | Boundary - no active UI      |
| TC-227  | contextMenu takes priority over dialog when both are active (TC-227)                  | PASS | 0          | Validation - priority order  |
| TC-228  | repoDropdown takes priority over branchDropdown when both are open (TC-228)           | PASS | 0          | Validation - priority order  |

### テスト実行コマンド

```bash
node_modules/.bin/vitest run tests/src/config.test.ts
node_modules/.bin/vitest run tests/src/gitGraphView.test.ts
node_modules/.bin/vitest run tests/web/main.test.ts
```

### カバレッジ

未取得（`--coverage` フラグ無しで実行）。

- `tests/src/config.test.ts`: 65/65 PASS
- `tests/src/gitGraphView.test.ts`: 75/75 PASS
- `tests/web/main.test.ts`: 231/231 PASS

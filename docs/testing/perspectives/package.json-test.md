# テスト観点表: package.json

> Source: `package.json`
> Generated: 2026-05-17T00:00:00Z
> Language: JSON (VS Code contributes schema)
> Test Framework: Vitest
> Storage Mode: single-file

## S1: contributes.configuration の minimum / pattern 検証 (Feature 040)

> Origin: Feature 040 (settings-and-copy-polish) (light-spec-plan)
> Added: 2026-05-17
> Status: active
> Supersedes: -
> Target Path: `package.json` (`contributes.configuration.properties`)
> Test File: `tests/src/config-defaults.test.ts`

`git-keizu.initialLoadCommits` / `git-keizu.loadMoreCommits` に `minimum: 1` が設定され、`git-keizu.graphColours.items.pattern` が rgba 4 引数 alternative を含むことを検証する。

| Case ID | Input / Precondition                                          | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result          | Notes              |
| ------- | ------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------ | ------------------ |
| TC-001  | `git-keizu.initialLoadCommits` schema 読み込み                | Normal - schema                                                            | `minimum` プロパティが 1 | 1 未満を拒否       |
| TC-002  | `git-keizu.loadMoreCommits` schema 読み込み                   | Normal - schema                                                            | `minimum` プロパティが 1 | 1 未満を拒否       |
| TC-003  | pattern に `rgba(1, 2, 3, 0.5)` / `rgba(1, 2, 3, 1)` をテスト | Normal - RGBA accepted                                                     | 両方が pattern にマッチ  | alpha 0-1 を許可   |
| TC-004  | pattern に `rgba(1, 2, 3)` をテスト                           | Validation - 3 args rejected                                               | pattern にマッチしない   | 3 引数 rgba は拒否 |
| TC-005  | pattern に `rgba(1, 2, 3, 1.5)` をテスト                      | Validation - alpha out of range                                            | pattern にマッチしない   | alpha > 1 を拒否   |
| TC-006  | pattern に `#0085d9` / `#0085d9cc` / `rgb(1, 2, 3)` をテスト  | Normal - classic forms                                                     | 全てが pattern にマッチ  | HEX/RGB の維持確認 |

# テスト観点表: web/main.ts

> Source: `web/main.ts`
> Generated: 2026-05-17T00:00:00Z
> Language: TypeScript
> Test Framework: Vitest
> Responsibility: load-count

## S39: maxCommits 正規化ヘルパー (Feature 040)

> Origin: Feature 040 (settings-and-copy-polish) (light-spec-plan)
> Added: 2026-05-17
> Status: active
> Supersedes: -
> Signature: `normalizeCommitLoadCount(value: number, defaultValue: number): number`
> Target Path: `web/main.ts`
> Test File: `tests/web/main.test.ts`

旧 webview state（`prevState.maxCommits`）が 0 / 負値 / 非有限値であっても、Load More / 自動読み込み加算後であっても、`requestLoadCommits` の payload が常に 1 以上となるようにする `normalizeCommitLoadCount` ヘルパーの挙動を検証する。

| Case ID | Input / Precondition          | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result | Notes                                         |
| ------- | ----------------------------- | -------------------------------------------------------------------------- | --------------- | --------------------------------------------- |
| TC-216  | `value=0, defaultValue=300`   | Boundary - lower bound                                                     | 1 を返す        | 0 を 1 に補正                                 |
| TC-217  | `value=-50, defaultValue=300` | Validation - negative                                                      | 1 を返す        | 負値を 1 に補正                               |
| TC-218  | `value=NaN, defaultValue=300` | Validation - non-finite                                                    | 300 を返す      | デフォルトへのフォールバック                  |
| TC-219  | `value=400, defaultValue=300` | Normal - positive                                                          | 400 を返す      | 正値は維持（Load More 加算後の典型値）        |
| TC-220  | `value=NaN, defaultValue=0`   | Validation - degenerate default                                            | 1 を返す        | デフォルトも下限未満の場合でも 1 が保証される |

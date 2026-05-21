# テスト観点表: web/main.ts

> Source: `web/main.ts`
> Generated: 2026-05-22T00:00:00Z
> Language: TypeScript
> Test Framework: Vitest
> Responsibility: request-queue

## S40: ロード要求の保留と再送 (Feature 041)

> Origin: Feature 041 (refresh-contention-and-dialog-escape) (light-spec-plan)
> Added: 2026-05-22
> Status: active
> Supersedes: -
> Signature: `GitKeizuView.requestLoadBranchesAndCommits(hard) / requestLoadCommits(hard, loadedCallback)`
> Target Path: `web/main.ts`
> Test File: `tests/web/main.test.ts`

`loadBranches` / `loadCommits` の応答待ち中に発生した後続要求を保留し、現在処理中の応答 callback 完了後に最新 state で再送する挙動を検証する。`loadBranchesCallback` / `loadCommitsCallback` は callback 実行前に null 化されるため、callback 内および flush 内の再送判定で stale な in-flight 状態に阻害されない。

| Case ID | Input / Precondition                                                                                                               | Perspective (Normal / Validation / Exception / External / Boundary / Type) | Expected Result                                                                                                                    | Notes                   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| TC-221  | `loadBranches` in-flight 中に `refresh(true)` を呼び、その後 `loadBranches` レスポンスが届く                                       | Normal - refresh during loadBranches                                       | 現在の `loadBranches` 応答処理後に `loadBranches` を再送する `sendMessage` が呼ばれる                                              | hard=true の再送        |
| TC-222  | `loadCommits` in-flight 中に branch filter を `["main"]` に変更し、その後 `loadCommits` レスポンスが届く                           | Normal - filter change during loadCommits                                  | 現在の `loadCommits` 応答処理後に `loadCommits` を再送し、payload の `branches` が最新 `["main"]` を使う                           | 最新 state で再送       |
| TC-223  | 自動 Load More が in-flight 中に filter 変更で再送が queue され、最終的に再送応答 callback が完了する                              | Normal - auto Load More callback queue                                     | queue された Load More callback が再送応答時に実行され `isLoadingMoreCommits` が `false` に戻り、次の自動 Load More が再度発火可能 | callback 喪失なし       |
| TC-224  | `loadCommits` in-flight 中に `requestLoadCommits(false, cb1)`、続けて `requestLoadCommits(true, cb2)` を queue する                | Boundary - hard OR 合成                                                    | 再送時の `loadCommits` payload で `hard=true` が使われ、`cb1` と `cb2` の両方が一度ずつ呼ばれる                                    | OR 合成と callback 集約 |
| TC-225  | `loadCommits` in-flight 中に branch filter を `["a"]` → `["b"]` に連続で変更し、その後 `loadCommits` レスポンスが届く              | Boundary - latest state at resend                                          | 再送 payload の `branches` が最後の `["b"]` を使い、`["a"]` の payload は送信されない                                              | 中間 state は破棄       |
| TC-226  | `pendingLoadCommits === null` の状態で `triggerLoadCommitsCallback` を呼ぶ                                                         | Boundary - empty queue flush                                               | 追加の `sendMessage` 呼び出しが発生せず、`pendingLoadCommits` は `null` のまま                                                     | no-op                   |
| TC-227  | `loadCommitsCallback` 内から再度 `requestLoadCommits(true, cb)` を呼ぶ（callback 実行時点で `loadCommitsCallback` は null になる） | Boundary - re-entrant request                                              | 再 entry 時に in-flight 判定で queue されず、新規 `loadCommits` `sendMessage` が即時送信される                                     | null 化のタイミング     |

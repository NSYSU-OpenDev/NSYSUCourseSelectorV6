# 貢獻指南

感謝你願意為 **NSYSU Course Selector V6** 出一份力！這份文件說明如何在本專案開發、送出變更，以及需要遵守的規範。

開發規範的完整細節放在 [AGENTS.md](AGENTS.md)，本文件只整理貢獻者最常用到的部分。

## 開發環境

- Node.js >= 20
- **必須使用 yarn**，請勿使用 npm（本專案以 `yarn.lock` 鎖定相依套件）
- 前端程式碼全部位於 `nsysu_selector_helper/` 目錄下

```powershell
git clone https://github.com/NSYSU-OpenDev/NSYSUCourseSelectorV6.git
cd NSYSUCourseSelectorV6/nsysu_selector_helper
yarn
yarn dev          # http://localhost:5173
```

> **PowerShell 提醒**：串接多個指令請使用 `;`，而非 bash 的 `&&`。

## 分支政策

| 變更類型 | 作法 |
| --- | --- |
| **功能開發、Bug 修復**（`nsysu_selector_helper/` 底下的任何變更） | **開分支 + 送 Pull Request**，請勿直接推送到 `main` |
| 相依套件升級、建置／CI 設定 | 開分支 + 送 Pull Request |
| 純文件變更（`README.md`、`AGENTS.md`、`CONTRIBUTING.md` 等） | 可直接提交至 `main` |

CI 只在「更動 `nsysu_selector_helper/**` 的 Pull Request」上執行；而 `main` 一旦有變更就會自動部署到 GitHub Pages。因此功能或修復若直接進 `main`，等於完全跳過型別檢查、測試與建置，出錯會直接影響使用者。

分支命名採 `<type>/<kebab-summary>`，type 與 commit 前綴共用同一組詞彙：

```powershell
git switch -c feat/course-review-panel
git switch -c fix/drag-selection-trigger
git switch -c i18n/filter-options
```

## Commit 訊息

採用 Conventional Commits，**並帶上 scope**：`<type>(<scope>): <描述>`

```
feat(schedule): add drag selection for time slots
fix(filter): correct the time slot toggle condition
i18n(sort-panel): translate sort rule labels
perf(course-list): reduce per-row work on scroll
docs(contributing): add commit convention
build(deps): bump ws
```

- **type**：`feat`、`fix`、`docs`、`i18n`、`perf`、`style`、`refactor`、`test`、`build`、`ci`
- **scope**：受影響的範圍，例如 `schedule`、`selector`、`filter`、`sort`、`labels`、`export`、`theme`、`store`、`services`、`api`、`deps`、`ci`；只有在變更真的橫跨整個專案時才省略
- **描述**：英文或繁體中文皆可，專案現行以英文為主；使用祈使句、開頭小寫、句尾不加句號

## 送出 Pull Request 前

請在 `nsysu_selector_helper/` 目錄下跑完與 CI 相同的檢查：

```powershell
yarn lint; yarn tsc -b --noEmit; yarn test; yarn build
```

接著：

1. 從 `main` 開一個分支
2. 完成變更並提交
3. 推送分支並開啟 Pull Request，填寫 PR 範本
4. 等待 CI 通過與維護者審查

## 程式碼規範重點

- **註解一律使用繁體中文**，包含函式說明、行內註解與 TODO
- **路徑別名**：元件用 `#/`，其餘用 `@/`（例：`import { CourseService } from '@/services'`）
- **localStorage 鍵值**必須加上 `NSYSUCourseSelector.` 前綴，避免在 GitHub Pages 上與其他專案衝突
- **i18n**：新的翻譯鍵必須**先**加入 `src/i18n/locales/zh-TW/translation.json`，否則型別檢查會失敗
- **商業邏輯放在 `src/services/`**，並在 `src/services/__tests__/` 補上單元測試；篩選、排序、衝堂判斷、匯出等邏輯請勿寫在元件或 reducer 裡
- **響應式**：桌機版（Splitter）與手機版（Collapse）兩套版面同時掛載，僅由 768px 的 media query 切換顯示，UI 變更請兩邊都確認

## 回報問題

請使用 [Issue 範本](https://github.com/NSYSU-OpenDev/NSYSUCourseSelectorV6/issues/new/choose) 回報 Bug 或提出功能建議。回報 Bug 時，附上瀏覽器、裝置與重現步驟能大幅加快處理速度。

## 行為準則

參與本專案即表示你同意遵守 [行為準則](CODE_OF_CONDUCT.md)。

## 授權

送出貢獻即表示你同意你的貢獻以 [MIT 授權條款](LICENSE) 釋出。

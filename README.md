# NSYSU Course Selector V6

🎓 **中山大學選課輔助系統第六版** - 全新架構，更好的用戶體驗

<div align="center">

[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)](https://www.typescriptlang.org/) [![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.8.2-purple?logo=redux)](https://redux-toolkit.js.org/)
[![Ant Design](https://img.shields.io/badge/Ant_Design-5.24.8-blue?logo=antdesign)](https://ant.design/) [![Vite](https://img.shields.io/badge/Vite-6.3.3-646CFF?logo=vite)](https://vitejs.dev/)

</div>

## 📖 專案介紹

該項目目前主要由 Claude 4 半自動化生成，旨在提供一個現代化的選課輔助系統，幫助中山大學學生更輕鬆地選擇課程。專案使用 React 18、TypeScript 和 Redux Toolkit 重構，提供更好的性能和用戶體驗。歡迎有興趣的開發者參與貢獻！

## ✨ 特色功能

- 🏗️ **現代化架構**：使用 React 18 + TypeScript + Redux Toolkit
- 📱 **響應式設計**：完美支援桌面端和移動端
- 🎨 **精美 UI**：基於 Ant Design 5 設計系統
- ⚡ **高效能**：使用 React Virtuoso 虛擬化大量課程列表
- 🌍 **國際化**：支援多語言切換
- 💾 **本地儲存**：自動保存選課狀態
- 🔍 **智能搜尋**：快速查找所需課程
- ⏰ **衝堂檢測**：自動檢測時間衝突
- 📊 **統計資訊**：即時顯示學分和時數

## 🏗️ 技術架構

### 前端技術棧
- **框架**：React 18.3.1
- **語言**：TypeScript 5.8.3
- **狀態管理**：Redux Toolkit 2.8.2 + React Redux 9.2.0
- **UI 框架**：Ant Design 5.24.8
- **樣式方案**：Styled Components 6.1.17
- **建構工具**：Vite 6.3.3
- **國際化**：React i18next 15.5.1
- **虛擬化**：React Virtuoso 4.12.6

### 專案結構
```
nsysu_selector_helper/
├── src/
│   ├── components/          # React 組件
│   │   ├── ScheduleTable.tsx     # 課表組件
│   │   ├── SelectorPanel.tsx     # 選課面板
│   │   └── SelectorPanel/        # 選課面板子組件
│   ├── store/              # Redux 狀態管理
│   │   ├── slices/              # Redux 切片
│   │   ├── hooks.ts             # 類型安全的 Redux hooks
│   │   └── selectors.ts         # 狀態選擇器
│   ├── api/                # API 介面
│   ├── services/           # 業務邏輯服務
│   ├── hooks/              # 自定義 React hooks
│   ├── i18n/               # 國際化配置
│   ├── types/              # TypeScript 類型定義
│   └── constants/          # 常數定義
├── public/                 # 靜態資源
└── package.json
```

## 🚀 快速開始

### 環境要求
- Node.js >= 20.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安裝與執行

1. **克隆專案**
   ```bash
   git clone https://github.com/NSYSU-OpenDev/NSYSUCourseSelectorV6.git
   cd NSYSUCourseSelectorV6/nsysu_selector_helper
   ```

2. **安裝依賴**
   ```bash
   yarn
   ```

3. **啟動開發伺服器**
   ```bash
   yarn dev
   ```

4. **開啟瀏覽器**
   ```
   http://localhost:5173
   ```

### 建構部署

```bash
# 確保在專案根目錄下
cd NSYSUCourseSelectorV6/nsysu_selector_helper

# 建構生產版本
yarn build

# 預覽建構結果
yarn preview

# 程式碼格式化
yarn format

# 組件測試
yarn test
```

## 🎯 功能特點

### 核心功能
- [x] **課程瀏覽**：展示所有課程，支援學期篩選
- [x] **課程搜尋**：即時搜尋課程名稱、教師、課程程式碼，盡可能用單一搜尋框實現廣泛匹配
- [x] **課程精確篩選**：支援所有條件的 (包含/不包含) 精確篩選
- [x] **選課管理**：新增、移除選課
- [x] **課表顯示**：視覺化課表，清楚顯示上課時間和地點
- [x] **衝堂檢測**：自動檢測時間衝突並提醒
- [x] **餘額顯示**：即時顯示課程剩餘名額
- [x] **本地儲存**：自動保存選課狀態到瀏覽器
- [x] **學分統計**：顯示已選課程的總學分和時數
- [x] **時間點擊篩選**：點擊課表時間段快速篩選該時段課程
- [x] **自訂課程排序**：允許用戶自定義課程顯示順序 (如按選上概率、學分等)
- [x] **允續自訂課程樣式**：允許用戶自定義特定課程課表樣式 (背景色、框線色等)
- [ ] **導出自動填入腳本**：生成自動填入選課系統的腳本
- [ ] **導入AI輔助選課**：整合 AI 功能，提供更智慧檢索和推薦功能
- [ ] **課程評價**：顯示其他學生對課程的評價和建議 (MongoDB 整合待實現)

### 使用體驗
- [x] **響應式設計**：桌面端和移動端完美適配
- [x] **虛擬化列表**：大量課程資料流暢滾動
- [x] **Loading 狀態**：優雅的載入動畫
- [x] **錯誤處理**：友善的錯誤提示
- [ ] **鍵盤支援**：支援鍵盤快捷鍵操作

## 🏛️ 狀態管理架構

採用 Redux Toolkit 進行狀態管理，結構清晰且易於維護：

### 狀態切片
- **coursesSlice**：課程資料、選課狀態管理
- **uiSlice**：UI 狀態管理（tab 切換、hover 狀態等）

### 主要狀態
```typescript
interface RootState {
  courses: {
    courses: Course[]
    selectedCourses: Course[]
    availableSemesters: AcademicYear
    selectedSemester: string
    loading: boolean
  }
  ui: {
    selectedTabKey: string
    hoveredCourseId: string
    activeCollapseKey: string | string[]
  }
}
```

## 📱 移動端支援

專門為移動端設備優化：
- 使用 Ant Design Collapse 組件實現可摺疊的課表和選課面板
- 觸控友善的交互設計
- 適配小螢幕的字體和間距
- 支援手勢操作

## 🌍 國際化支援

支援多語言切換：
- [x] 繁體中文（預設）
- [ ] 英文 (待實現)

## 🔧 開發工具

### 程式碼品質
- **ESLint**：程式碼檢查和規範
- **Prettier**：程式碼格式化
- **TypeScript**：靜態類型檢查

### 開發體驗
- **Hot Module Replacement**：快速熱重載
- **Source Maps**：便於除錯
- **TypeScript 嚴格模式**：確保程式碼品質

## 📋 更新日誌

### v6.1.0 (2025-06-03)
- 🔄 **架構重構**：從 useState 遷移到 Redux Toolkit
- 🎨 **UI 升級**：升級到 Ant Design 5
- 📱 **移動端優化**：全新的移動端適配
- ⚡ **效能提升**：使用虛擬化列表提升效能
- 🌍 **國際化**：新增多語言支援
- 💾 **狀態持久化**：改善本地儲存機制

### 已完成功能
- [x] 完成主課程列表顯示
- [x] 實現課程摺疊/展開功能
- [x] 顯示課程剩餘名額
- [x] Redux 狀態管理遷移
- [x] 移動端響應式設計
- [x] 本地儲存整合

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 本專案
2. 建立功能分支：`git checkout -b feature/new-feature`
3. 提交變更：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

## 📄 授權

本專案採用 MIT 授權條款。詳情請見 [LICENSE](LICENSE) 文件。

## 🙏 致謝

- 感謝中山大學提供課程資料 API
- 感謝所有貢獻者的努力

---

**🎓 讓選課變得更簡單、更直觀！**

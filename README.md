# 全台測速分析系統 (Speed Camera Analysis System)

這是一個全端網頁應用程式，整合地圖視覺化、駕駛模擬與數據分析功能，協助使用者了解全台測速照相點分佈與相關資訊。

🚀 **線上即時預覽**: [https://speedy-1f0c9.web.app/](https://speedy-1f0c9.web.app/)

---

## ✨ 核心功能 (Features)

1.  **首頁 (Home)**
    - 系統入口與導覽。
2.  **測速模擬與地圖 (Simulation)**
    - **地圖視覺化**: 使用 Leaflet 顯示全台測速照相點。
    - **駕駛模擬**: 模擬行車視角，提供類似遊戲的 `W/A/S/D` 駕駛操作。
    - **即時警示**: 當車輛接近測速點且位於拍攝範圍內時，系統會發出視覺警示。
3.  **數據分析 (Analytics)**
    - **視覺化圖表**: 提供各縣市測速點數量排名 (長條圖) 與分佈佔比 (圓餅圖)。
    - **篩選與搜尋**: 支援依速限篩選顯示，並可搜尋特定路段或城市。
    - **詳細清單**: 表格化列出所有測速點詳細資訊。
4.  **資料管理**
    - 支援使用者新增測速照相點資訊，並直接寫入 Firebase Firestore 資料庫。

---

## 🛠️ 技術架構 (Technology Stack)

| 類別 | 技術 / 套件 | 說明 |
| :--- | :--- | :--- |
| **Frontend** | **React 19** | 核心 UI 框架 (Vite 建置) |
| | **Tailwind CSS** | 樣式與 RWD 設計 |
| | **React-Leaflet** | 地圖與地理標記整合 |
| | **Recharts** | 數據分析圖表繪製 |
| | **React Router v7** | 路由管理 |
| | **Axios** | API 請求處理 |
| **Backend** | **Firebase** | Firestore 資料庫、Hosting 託管 |
| | *Express.js* | (Legacy) 本地 API 伺服器 |
| | *Lowdb* | (Legacy) 本地輕量級 JSON 資料庫 |
| **Tools** | **Git / GitHub** | 版本控制 |

> **Note**: 本專案目前已全面整合 **Firebase** 進行資料儲存與託管，舊版 Express Server 與 db.json 保留供參考或本地開發備用。

---

## 📸 系統截圖 (Screenshots)

### 📊 數據分析頁面
整合圖表與詳細數據列表，清楚掌握全台測速點資訊。
<img width="1350" alt="分析頁面概覽" src="https://github.com/user-attachments/assets/62df0ea5-cafd-456f-85d7-b819db25922a" />

<div style="display: flex; gap: 10px;">
  <img width="48%" alt="圓餅圖" src="https://github.com/user-attachments/assets/4c7f013f-a625-4dd5-aace-b9559f35f487" />
  <img width="48%" alt="表格資料" src="https://github.com/user-attachments/assets/83b61519-10ba-45ba-8efa-50288f14ba5c" />
</div>

### 🚗 駕駛模擬頁面
提供互動式地圖，支援鍵盤控制車輛移動。
> **控制方式**: `W` (前進), `S` (後退), `A` (左轉), `D` (右轉)

<img width="100%" alt="模擬與警示" src="https://github.com/user-attachments/assets/253a7177-facd-4796-9527-abe9a3aa9406" />  
<br/>
<img width="100%" alt="模擬駕駛視角" src="https://github.com/user-attachments/assets/482dd732-0a67-4eb8-92b2-041491d56d4a" />


---

## 🚀 如何在本地執行 (Local Development)

1.  **Clone 專案**
    ```bash
    git clone https://github.com/binghao9312/Nkust-114-1_Source.git
    cd Nkust-114-1_Source
    ```

2.  **快速部署 (Optional)**
    如果您想快速打包並部署到 Firebase，可以直接執行根目錄下的自動腳本：
    *   **Windows**: 雙擊 `deploy.bat`

3.  **手動安裝與執行 (Manual Setup)**
    
    *   **安裝依賴**
        ```bash
        cd web-app/client
        npm install
        ```

    *   **設定環境變數** (可選，目前已內建 Fallback 設定)
        若需使用自定義專案，請在 `client` 目錄下建立 `.env` 檔案。

    *   **啟動開發伺服器**
        ```bash
        npm run dev
        ```

---

## ℹ️ 關於與版權

*   **作者**: C111152325 四子四丙 楊秉豪
*   **資料來源**: [政府資料開放平台 - 測速執法設置點](https://data.gov.tw/dataset/7320)

# 全台測速分析系統
## 本專案已部屬在firebase  
https://speedy-1f0c9.web.app/  

## 技術架構 (Technology Stack)  
前端 (Client - web-app/client)  

框架: React 19 (使用 Vite 建置)  
語言: JavaScript (ES Modules)  
樣式: Tailwind CSS - 用於快速切版與樣式設計  

## 地圖與視覺化:
react-leaflet / leaflet: 用於顯示地圖與測速點  
recharts: 用於數據圖表分析  
lucide-react: 提供 UI 圖示  
路由: React Router DOM v7 - 處理頁面切換  
資料串接: Axios - 用於與後端 API 溝通  
雲端整合: Firebase

## 後端 (Server - web-app/server)

執行環境: Node.js  
框架: Express.js - 提供 RESTful API 服務  
### 資料庫:  
目前已將資料上傳至firebase裡面的 firestore database  
<img width="1827" height="868" alt="image" src="https://github.com/user-attachments/assets/10c7582b-f9a0-4825-ba73-ada3a81f9699" />  
Lowdb (JSON File) (db.json) - 輕量級的檔案型資料庫  
L資料來源也包含 CSV 檔案 (NPA_TD1.csv)，透過 csv-parser 處理  

## API 介面:
GET /points: 取得所有測速照相點資料。  
POST /points: 新增測速照相點。  



首頁 (Home) (Home.jsx)  
系統入口頁面。  
測速模擬與地圖 (Simulation) (Simulation.jsx)  
地圖顯示: 在地圖上標示全台測速照相點位置  
駕駛模擬: 依據檔案名稱推測，可能包含模擬行車路線並在接近測速點時顯示資訊的功能  
數據分析 (Analytics) (Analytics.jsx)  
統計圖表: 利用 recharts 將測速點資料視覺化 (例如：各縣市測速點數量分佈、速限分佈等)  
資料管理 (Data Management) (AddDataForm.jsx)  
新增測速點: 提供表單介面讓使用者輸入新的測速照相資訊 (城市、速限等)，並透過 POST /points 存入後端  
資料遷移 (Migration) (migrate.js)  
包含資料遷移腳本，顯示系統可能正在或計畫從本地 JSON/CSV 轉移至 Firebase Firestore 資料庫  


## 2種操作模式 
  
<img width="822" height="562" alt="image" src="https://github.com/user-attachments/assets/9a48d721-1d6a-4360-863b-1e6ac204e9bd" />  

## 分析頁面  
<img width="1350" height="866" alt="image" src="https://github.com/user-attachments/assets/62df0ea5-cafd-456f-85d7-b819db25922a" />  
<img width="1292" height="828" alt="image" src="https://github.com/user-attachments/assets/4c7f013f-a625-4dd5-aace-b9559f35f487" />  
<img width="1308" height="531" alt="image" src="https://github.com/user-attachments/assets/83b61519-10ba-45ba-8efa-50288f14ba5c" />  

## 模擬頁面
### 輸入w/a/s/d/ 控制前後左右  
<img width="1194" height="822" alt="image" src="https://github.com/user-attachments/assets/253a7177-facd-4796-9527-abe9a3aa9406" />  
<img width="1174" height="822" alt="image" src="https://github.com/user-attachments/assets/4d232aca-5dea-46d6-bf56-189414dc423e" />  
  



## 作者：C111152325 四子四丙 楊秉豪
### 資料來源：政府資料開放平台 
https://data.gov.tw/dataset/7320   

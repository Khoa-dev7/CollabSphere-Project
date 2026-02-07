import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Đảm bảo import đúng file App
import "./style.css"

// XÓA BỎ dòng import { BrowserRouter } ...

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* XÓA BỎ thẻ <BrowserRouter> bao quanh App */}
    <App />
    {/* XÓA BỎ thẻ đóng </BrowserRouter> */}
  </React.StrictMode>,
)
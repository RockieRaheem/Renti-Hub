import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { BuildingProvider } from './context/BuildingContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BuildingProvider>
        <App />
      </BuildingProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

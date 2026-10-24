import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import './pages.css'
import './app-pages.css'
import './responsive.css'
import './misc.css'
import './player-extras.css'
import './premium-visual.css'
import './assessment.css'
import './auth-and-brands.css'
import './mdn-path.css'
import './school-journey.css'
import './experience-redesign.css'
import './campus-finish.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter basename={import.meta.env.BASE_URL}><App /></BrowserRouter></React.StrictMode>,
)

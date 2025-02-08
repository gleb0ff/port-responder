import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'

import './style.css'

const container = document.getElementById('root')
const root = createRoot(container)

const render = () => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

render()

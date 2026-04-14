import { render } from 'preact'
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from './components/ui'

render(
  <BrowserRouter>
    <App />
    <ToastContainer />
  </BrowserRouter>,
  document.getElementById('root') as HTMLElement
)

import { render } from 'preact'
import App from './App'
import './ui/css/styles.css'
import { ToastContainer } from './ui/Toast'

render(
  <>
    <App />
    <ToastContainer />
  </>,
  document.getElementById('app') as HTMLElement
)
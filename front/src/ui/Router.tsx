import { useState, useEffect } from 'preact/hooks'
import type { ComponentType } from 'preact'
import { extend } from '../stores'
import { Path } from '../type'

type RouteConfig = {
  path: string
  component: () => Promise<ComponentType>
}

const routeConfigs: RouteConfig[] = [
  { path: '/', component: () => import('../components/LogIn').then(m => m.default) },
  { path: '/login', component: () => import('../components/LogIn').then(m => m.default) },
  { path: '/register', component: () => import('../components/Register/Register').then(m => m.default) },
  { path: '/welcome', component: () => import('../components/Welcome').then(m => m.default) },
  { path: '/alarms', component: () => import('../components/Alarms/Alarms').then(m => m.default) },
  { path: '/activate', component: () => import('../components/User/Activate').then(m => m.default) },
  { path: '/owner', component: () => import('../components/Admin/Owner').then(m => m.default) },
  { path: '/admin', component: () => import('../components/Admin/Admin').then(m => m.default) },
  { path: '/reset-password', component: () => import('../components/ResetPassword').then(m => m.default) },
  { path: '/play-alarm', component: () => import('../components/Alarms/PlayAlarm').then(m => m.default) },
  { path: '/clueless', component: () => import('../components/Clueless').then(m => m.default) },
]

export function Router() {
  const [url, setUrl] = useState(window.location.pathname)
  const [Component, setComponent] = useState<ComponentType | null>(null)
  const [Loading, setLoading] = useState(true)

  useEffect(() => {
    const handlePop = () => setUrl(window.location.pathname)
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  useEffect(() => {
    setLoading(true)
    const matched = routeConfigs.find(r => r.path === url)
    const target = matched || routeConfigs[0]
    target.component().then((mod) => {
      setComponent(() => mod)
      setLoading(false)
    }).catch((err: unknown) => {
      console.error('[Router] Failed to load route:', url, err)
      setLoading(false)
    })
  }, [url])

  if (Loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
  }

  return Component ? <Component /> : null
}

export function navigateTo(path: Path) {
  const pathStr = extend(path)
  window.history.pushState(null, '', pathStr)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
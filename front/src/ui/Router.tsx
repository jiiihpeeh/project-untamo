import { useState, useEffect, ComponentChildren } from 'preact/hooks'

type RouteConfig = {
  path: string
  component: any
}

interface RouterProps {
  routes: RouteConfig[]
  onChange?: (e: { url: string }) => void
}

export function Router({ routes, onChange }: RouterProps) {
  const [url, setUrl] = useState(window.location.pathname)

  useEffect(() => {
    const handlePop = () => setUrl(window.location.pathname)
    
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  const matchRoute = () => {
    for (const route of routes) {
      if (route.path === url) {
        return route.component
      }
    }
    // Default route
    for (const route of routes) {
      if (route.path === '/') {
        return route.component
      }
    }
    return null
  }

  const Component = matchRoute()
  
  if (!Component) {
    return <div>Not Found</div>
  }

  return <Component />
}
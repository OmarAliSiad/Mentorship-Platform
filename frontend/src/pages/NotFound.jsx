import { ArrowLeft, Home, ShieldX } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

const dashboardFor = (role) => {
  if (role === 'Student') return '/student/dashboard'
  if (role === 'Mentor') return '/mentor/dashboard'
  if (role === 'Admin') return '/admin'
  return '/'
}

const NotFound = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const home = isAuthenticated ? dashboardFor(user?.role) : '/'

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-6 py-12 text-foreground">
      <div className="not-found-bg pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--primary)_0,transparent_28%),radial-gradient(circle_at_80%_0%,var(--muted)_0,transparent_24%)] opacity-20" />
      <section className="not-found-card relative w-full max-w-3xl rounded-md border border-border bg-card/80 p-8 text-card-foreground shadow-2xl backdrop-blur md:p-12">
        <div className="mb-8 inline-flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          <ShieldX className="size-4 text-primary" />
          Route unavailable
        </div>

        <p className="not-found-code text-8xl font-black leading-none text-primary md:text-9xl">404</p>
        <h1 className="mt-5 text-3xl font-semibold md:text-5xl">This page is off limits.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          The link is broken, missing, or your current role cannot access this area.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link to={home}>
              <Home className="size-4" />
              {isAuthenticated ? 'Back to dashboard' : 'Back home'}
            </Link>
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
            Go back
          </Button>
        </div>
      </section>
    </main>
  )
}

export default NotFound

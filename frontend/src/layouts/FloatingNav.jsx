import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { Button } from '@/components/ui/button'
import mentHubLogoDark from '@/assets/menthub-logo-dark.png'
import mentHubLogoLight from '@/assets/menthub-logo-light.png'

const getDashboardUrl = (role) => {
  if (role === 'Student') return '/student/dashboard'
  if (role === 'Mentor') return '/mentor/dashboard'
  if (role === 'Admin') return '/admin'
  return '/'
}

const getDashboardLabel = (role) => {
  if (role === 'Student') return 'My Sessions'
  if (role === 'Mentor') return 'My Workspace'
  if (role === 'Admin') return 'Admin Console'
  return 'Dashboard'
}

const navLinks = [
  { label: 'Find Mentors', to: '/mentors' },
  { label: 'Become a Mentor', to: '/login?intent=mentor' },
]

function MentHubLogoMark() {
  return (
    <span
      className="flex h-10 w-[4.125rem] shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]"
      aria-hidden="true"
    >
      <img
        src={mentHubLogoLight}
        alt=""
        className="block h-full w-auto max-w-none object-contain drop-shadow-[0_6px_12px_rgba(15,23,42,0.12)] dark:hidden"
        draggable="false"
      />
      <img
        src={mentHubLogoDark}
        alt=""
        className="hidden h-full w-auto max-w-none object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] dark:block"
        draggable="false"
      />
    </span>
  )
}

export function FloatingNav() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const location = useLocation()

  const dashUrl = user ? getDashboardUrl(user.role) : '/'
  const dashLabel = user ? getDashboardLabel(user.role) : 'Dashboard'
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email ? user.email.slice(0, 2).toUpperCase() : 'U'

  const isNavActive = (to) => {
    if (to === '/mentors') return location.pathname.startsWith('/mentors')
    if (to === '/#cta') return location.pathname === '/' && location.hash === '#cta'
    if (to.startsWith('/login')) {
      return location.pathname === '/login' && location.search.includes('intent=mentor')
    }
    if (to.startsWith('/admin')) return location.pathname.startsWith('/admin')

    return location.pathname === to
  }

  return (
    <div className="fixed top-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-7xl -translate-x-1/2 sm:w-[calc(100%-2rem)]">
      <nav
        className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-3 rounded-[1.375rem] border border-black/10 bg-white/[0.72] px-3 py-2 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/70 dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)] md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-4 lg:px-5"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          className="group flex min-w-0 items-center gap-2.5 justify-self-start rounded-full px-1.5 py-1.5 transition-transform duration-300 hover:scale-[1.02]"
          aria-label="MentHub home"
        >
          <MentHubLogoMark />
          <span className="text-sm font-semibold tracking-tight text-foreground dark:text-white sm:text-base">
            MentHub
          </span>
        </Link>

        <div className="hidden items-center justify-center gap-1 justify-self-center rounded-full border border-black/5 bg-black/[0.03] p-1 dark:border-white/5 dark:bg-white/[0.03] md:flex">
          {(() => {
            // determine links to show based on auth+role
            let centerLinks = [];
            if (!isAuthenticated) {
              centerLinks = [
                { label: 'Find Mentors', to: '/mentors' },
                { label: 'Become a Mentor', to: '/login?intent=mentor' },
                { label: 'Pricing', to: '/#cta' }
              ];
            } else if (user?.role === 'Student') {
              centerLinks = [ { label: 'Find Mentors', to: '/mentors' } ];
            } else if (user?.role === 'Mentor') {
              centerLinks = []; // Mentors don't browse for mentors
            } else if (user?.role === 'Admin') {
              centerLinks = [
                { label: 'Admin Console', to: '/admin' },
              ];
            }

            return centerLinks.map(({ label, to }) => {
              const active = isNavActive(to);
              return (
                <Link
                  key={label}
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/[0.06] hover:text-foreground dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white lg:px-4',
                    active && 'bg-black/[0.06] text-foreground shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] dark:bg-white/[0.1] dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]',
                  )}
                >
                  {label}
                  {active ? (
                    <span className="absolute inset-x-5 -bottom-1 mx-auto h-0.5 rounded-full bg-primary shadow-[0_0_10px_rgba(232,113,48,0.5)]" />
                  ) : null}
                </Link>
              )
            })
          })()}
        </div>

        <div className="flex items-center justify-end gap-1.5 justify-self-end sm:gap-2">
          <button
            onClick={toggleTheme}
            className="inline-flex size-10 items-center justify-center rounded-full border border-black/10 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white dark:focus-visible:ring-white/20"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashUrl}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-primary/30 bg-primary/15 px-4 text-sm font-medium text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/20"
                >
                  {dashLabel}
                </Link>
                <Link
                  to={dashUrl}
                  className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-[0_10px_26px_rgba(232,113,48,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-primary/95"
                  aria-label={`Go to dashboard (${user?.role})`}
                >
                  {initials}
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-black/10 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white dark:focus-visible:ring-white/20"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="size-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={cn(
                    'rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/[0.06] hover:text-foreground dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white',
                    location.pathname === '/login' && !location.search && 'bg-black/[0.06] text-foreground dark:bg-white/[0.1] dark:text-white',
                  )}
                >
                  Login
                </Link>
                <Button
                  asChild
                  className="h-11 rounded-full border border-primary/30 bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[0_12px_28px_rgba(232,113,48,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-primary/95 hover:shadow-[0_16px_34px_rgba(232,113,48,0.3)]"
                >
                  <Link to="/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-black/10 text-muted-foreground transition-all duration-300 hover:bg-black/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 dark:border-white/10 dark:text-white/75 dark:hover:bg-white/[0.08] dark:hover:text-white dark:focus-visible:ring-white/20 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mt-2 flex flex-col gap-1 rounded-[1.25rem] border border-black/10 bg-white/[0.86] p-2.5 shadow-[0_20px_55px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/[0.85] dark:shadow-[0_20px_55px_rgba(0,0,0,0.28)] md:hidden">
          {(() => {
            let mobileLinks = [];
            if (!isAuthenticated) {
              mobileLinks = [
                { label: 'Find Mentors', to: '/mentors' },
                { label: 'Become a Mentor', to: '/login?intent=mentor' },
                { label: 'Pricing', to: '/#cta' }
              ];
            } else if (user?.role === 'Student') {
              mobileLinks = [ { label: 'Find Mentors', to: '/mentors' } ];
            } else if (user?.role === 'Mentor') {
              mobileLinks = []; // Mentors don't browse for mentors
            } else if (user?.role === 'Admin') {
              mobileLinks = [
                { label: 'Admin Console', to: '/admin' },
              ];
            }

            return mobileLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                onClick={() => setMobileOpen(false)}
                aria-current={isNavActive(to) ? 'page' : undefined}
                className={cn(
                  'rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-black/[0.06] hover:text-foreground dark:text-white/75 dark:hover:bg-white/[0.08] dark:hover:text-white',
                  isNavActive(to) && 'bg-black/[0.06] text-foreground shadow-[inset_3px_0_0_var(--primary)] dark:bg-white/[0.1] dark:text-white',
                )}
              >
                {label}
              </Link>
            ))
          })()}

          <div className="my-1 h-px bg-black/10 dark:bg-white/10" />

          {isAuthenticated ? (
            <>
              <Link
                to={dashUrl}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-black/[0.06] hover:text-foreground dark:text-white/80 dark:hover:bg-white/[0.08] dark:hover:text-white"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {initials}
                </span>
                {dashLabel}
              </Link>
              <button
                onClick={() => {
                  logout()
                  setMobileOpen(false)
                }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-black/[0.06] hover:text-foreground dark:text-white/80 dark:hover:bg-white/[0.08] dark:hover:text-white"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-black/[0.06] hover:text-foreground dark:text-white/80 dark:hover:bg-white/[0.08] dark:hover:text-white"
              >
                Login
              </Link>
              <Button
                asChild
                className="mt-1 h-11 rounded-2xl border border-primary/30 bg-primary text-sm font-medium text-primary-foreground shadow-[0_12px_28px_rgba(232,113,48,0.24)] transition-all duration-300 hover:bg-primary/95"
              >
                <Link to="/login">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { Button } from '@/components/ui/button'

const getDashboardUrl = (role) => {
  if (role === 'Student') return '/student/dashboard'
  if (role === 'Mentor') return '/mentor/dashboard'
  if (role === 'Admin') return '/admin'
  return '/'
}

export function FloatingNav() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const location = useLocation()

  const dashUrl = user ? getDashboardUrl(user.role) : '/'
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'U'

  const navLinks = [
    { label: 'Mentors', to: '/mentors' },
    ...(isAuthenticated ? [{ label: 'Dashboard', to: dashUrl }] : []),
  ]

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
      {/* Pill nav */}
      <nav
        className="flex items-center justify-between gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 shadow-lg backdrop-blur-xl"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 px-2 shrink-0"
          aria-label="MentHub home"
        >
          <span className="text-sm font-bold tracking-tight text-foreground">
            MentHub
          </span>
        </Link>

        {/* Center links — desktop */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className={cn(
                'px-4 py-2 text-sm rounded-full transition-colors',
                location.pathname === to
                  ? 'text-foreground bg-muted font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {/* Auth — desktop only */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashUrl}
                  className="inline-flex items-center justify-center size-9 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
                  aria-label={`Go to dashboard (${user?.role})`}
                >
                  {initials}
                </Link>
                <button
                  onClick={logout}
                  className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full"
                >
                  Login
                </Link>
                <Button asChild size="sm">
                  <Link to="/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden mt-2 rounded-2xl border border-border/70 bg-background/95 backdrop-blur-xl p-3 shadow-2xl flex flex-col gap-1">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-sm text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              {label}
            </Link>
          ))}

          <div className="my-1 h-px bg-border" />

          {isAuthenticated ? (
            <>
              <Link
                to={dashUrl}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted rounded-xl transition-colors"
              >
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {initials}
                </span>
                My Dashboard
              </Link>
              <button
                onClick={() => {
                  logout()
                  setMobileOpen(false)
                }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted rounded-xl transition-colors"
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
                className="px-4 py-3 text-sm text-foreground hover:bg-muted rounded-xl transition-colors"
              >
                Login
              </Link>
              <Button asChild className="mt-1">
                <Link to="/login">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

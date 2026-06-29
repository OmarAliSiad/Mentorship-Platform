import * as React from 'react'
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5005/api'

const initialFormState = {
  email: '',
  password: '',
  role: 'Student',
}

const authCopy = {
  login: {
    badge: 'Welcome Back',
    heading: 'Sign in',
    description: 'Access your MentHub workspace and continue your mentorship journey.',
  },
  register: {
    badge: 'Join MentHub',
    heading: 'Create your account',
    description: 'Start your mentorship journey by creating a free MentHub account.',
  },
}

const fieldShellClass =
  'group relative flex min-h-16 items-center gap-3 rounded-2xl border border-black/10 bg-white/75 px-4 shadow-[0_1px_0_rgba(255,255,255,0.65),0_12px_28px_rgba(15,23,42,0.05)] transition-all duration-300 hover:border-primary/25 hover:bg-white/90 focus-within:border-primary/45 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(232,113,48,0.10),0_18px_42px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:border-primary/25 dark:hover:bg-white/[0.065] dark:focus-within:border-primary/45 dark:focus-within:bg-white/[0.075] dark:focus-within:shadow-[0_0_0_4px_rgba(232,113,48,0.13),0_18px_48px_rgba(0,0,0,0.36)]'

const fieldLabelClass =
  'text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/85'

const fieldErrorClass =
  'text-[11px] font-semibold uppercase tracking-[0.16em] text-destructive'

function AuthPage() {
  const login = useAuthStore((state) => state.login)
  const [mode, setMode] = React.useState('login')
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [form, setForm] = React.useState(initialFormState)
  const [errors, setErrors] = React.useState({})
  const [touched, setTouched] = React.useState({})
  const [showPassword, setShowPassword] = React.useState(false)
  const copy = authCopy[mode]

  React.useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1100)
    return () => window.clearTimeout(timer)
  }, [])

  const validate = React.useCallback(
    (nextMode, nextForm) => {
      const nextErrors = {}

      if (!nextForm.email.trim()) {
        nextErrors.email = 'Email is required.'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextForm.email)) {
        nextErrors.email = 'Enter a valid email address.'
      }

      if (!nextForm.password.trim()) {
        nextErrors.password = 'Password is required.'
      } else if (nextForm.password.length < 8) {
        nextErrors.password = 'Use at least 8 characters.'
      }

      if (nextMode === 'register' && !nextForm.role) {
        nextErrors.role = 'Choose a role to continue.'
      }

      return nextErrors
    },
    [],
  )

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setTouched((current) => ({ ...current, [field]: true }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleModeChange = (nextMode) => {
    setMode(nextMode)
    setErrors({})
    setTouched({})
    setShowPassword(false)
    setForm((current) => ({
      ...current,
      role: nextMode === 'register' ? current.role || 'Student' : current.role,
    }))
  }

  const fieldError = (name) => (touched[name] ? errors[name] : undefined)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate(mode, form)
    setErrors(nextErrors)
    setTouched({ email: true, password: true, role: mode === 'register' })

    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setErrors({})

    try {
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login'
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'register'
            ? { email: form.email, password: form.password, role: form.role }
            : { email: form.email, password: form.password },
        ),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.message || 'Authentication failed.')
      }

      login(payload)
      setForm(initialFormState)
    } catch (error) {
      setErrors({ form: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAFA] text-foreground dark:bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.055] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/18 blur-[120px] dark:bg-primary/20" />
        <div className="absolute left-[-12%] top-[-18%] h-[32rem] w-[32rem] rounded-full bg-primary/8 blur-[120px] dark:bg-primary/10" />
        <div className="absolute right-[-14%] top-[12%] h-[36rem] w-[36rem] rounded-full bg-slate-300/45 blur-[130px] dark:bg-white/[0.035]" />
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-white/90 to-transparent dark:from-white/[0.035]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-24 md:px-10 lg:px-16">
        <div className="grid w-full place-items-center">
          <section className="relative w-full max-w-2xl">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-primary/10 blur-3xl dark:bg-primary/14" aria-hidden="true" />
            <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-white/95 via-primary/12 to-black/5 opacity-80 dark:from-white/14 dark:via-primary/16 dark:to-transparent" aria-hidden="true" />

            <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white/72 p-5 text-card-foreground shadow-[0_28px_80px_rgba(15,23,42,0.14),0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/62 dark:shadow-[0_34px_90px_rgba(0,0,0,0.48),0_1px_0_rgba(255,255,255,0.08)_inset] md:p-10 lg:p-12">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/72 via-white/18 to-transparent dark:from-white/[0.075] dark:via-white/[0.025] dark:to-transparent" />
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-[78px] dark:bg-primary/16" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              <div className="relative z-10 mb-10 flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-sm">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/65 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.055]">
                    <Sparkles className="size-3.5 text-primary" />
                    {copy.badge}
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    {copy.heading}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {copy.description}
                  </p>
                </div>

                <div className="self-start rounded-full border border-black/10 bg-black/[0.035] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:self-auto">
                  <div className="relative grid h-10 w-[12.25rem] grid-cols-2 rounded-full">
                    <span
                      className={cn(
                        'absolute inset-y-0 left-0 w-1/2 rounded-full border border-primary/20 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.10)] transition-transform duration-300 ease-out dark:border-primary/25 dark:bg-white/[0.12] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]',
                        mode === 'register' && 'translate-x-full',
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => handleModeChange('login')}
                      className={cn(
                        'relative z-10 flex h-10 items-center justify-center rounded-full text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-300',
                        mode === 'login' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('register')}
                      className={cn(
                        'relative z-10 flex h-10 items-center justify-center rounded-full text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-300',
                        mode === 'register' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="relative z-10 space-y-5">
                  <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/45 dark:border-white/10 dark:bg-white/[0.04]">
                    <Skeleton className="h-24 w-full bg-muted/35" />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/45 dark:border-white/10 dark:bg-white/[0.04]">
                    <Skeleton className="h-16 w-full bg-muted/35" />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/45 dark:border-white/10 dark:bg-white/[0.04]">
                    <Skeleton className="h-16 w-full bg-muted/35" />
                  </div>
                  <div className="flex items-center justify-end">
                    <Skeleton className="h-14 w-48 rounded-full bg-muted/35" />
                  </div>
                </div>
              ) : (
                <form className="relative z-10 space-y-6" onSubmit={handleSubmit} noValidate>
                  {errors.form ? (
                    <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-5 py-4 text-sm font-medium text-destructive shadow-sm">
                      {errors.form}
                    </div>
                  ) : null}

                  <div className="space-y-2.5">
                    <label className={fieldLabelClass}>Email</label>
                    <div className={cn(fieldShellClass, fieldError('email') && 'border-destructive/50 hover:border-destructive/60 focus-within:border-destructive/70 focus-within:shadow-[0_0_0_4px_rgba(220,38,38,0.10)]')}>
                      <Mail className="size-5 shrink-0 text-muted-foreground/85 transition-colors duration-300 group-focus-within:text-primary" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) => setField('email', event.target.value)}
                        className={cn('h-12 w-full bg-transparent text-base font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/55 focus:placeholder:text-muted-foreground/40', fieldError('email') && 'placeholder:text-destructive/40')}
                        placeholder="you@domain.com"
                        autoComplete="email"
                      />
                    </div>
                    {fieldError('email') ? <p className={fieldErrorClass}>{fieldError('email')}</p> : null}
                  </div>

                  <div className="space-y-2.5">
                    <label className={fieldLabelClass}>Password</label>
                    <div className={cn(fieldShellClass, fieldError('password') && 'border-destructive/50 hover:border-destructive/60 focus-within:border-destructive/70 focus-within:shadow-[0_0_0_4px_rgba(220,38,38,0.10)]')}>
                      <Lock className="size-5 shrink-0 text-muted-foreground/85 transition-colors duration-300 group-focus-within:text-primary" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(event) => setField('password', event.target.value)}
                        className={cn('h-12 w-full bg-transparent text-base font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/55 focus:placeholder:text-muted-foreground/40', fieldError('password') && 'placeholder:text-destructive/40')}
                        placeholder="••••••••"
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="shrink-0 rounded-full border border-black/10 bg-black/[0.035] p-2.5 text-muted-foreground transition-all duration-300 hover:border-primary/20 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 dark:border-white/10 dark:bg-white/[0.045]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {fieldError('password') ? <p className={fieldErrorClass}>{fieldError('password')}</p> : null}
                  </div>

                  {mode === 'register' ? (
                    <div className="space-y-2.5">
                      <label className={fieldLabelClass}>Role</label>
                      <Select value={form.role} onValueChange={(value) => setField('role', value)}>
                        <SelectTrigger
                          className={cn(
                            'min-h-16 rounded-2xl border border-black/10 bg-white/75 px-4 pb-0 text-base font-medium shadow-[0_1px_0_rgba(255,255,255,0.65),0_12px_28px_rgba(15,23,42,0.05)] transition-all duration-300 hover:border-primary/25 hover:bg-white/90 focus:border-primary/45 focus:shadow-[0_0_0_4px_rgba(232,113,48,0.10),0_18px_42px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:border-primary/25 dark:hover:bg-white/[0.065] dark:focus:border-primary/45 dark:focus:bg-white/[0.075]',
                            fieldError('role') && 'border-destructive/50 focus:border-destructive/70 focus:ring-destructive',
                          )}
                        >
                          <SelectValue placeholder="Choose a role" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-black/10 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90">
                          <SelectItem value="Student" className="rounded-xl text-base hover:bg-primary/10 aria-selected:bg-primary/10">Student</SelectItem>
                          <SelectItem value="Mentor" className="rounded-xl text-base hover:bg-primary/10 aria-selected:bg-primary/10">Mentor</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldError('role') ? <p className={fieldErrorClass}>{fieldError('role')}</p> : null}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-5 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                      {mode === 'login' ? 'Access your mentorship workspace.' : 'Create a new mentorship identity.'}
                    </p>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="h-14 min-w-44 rounded-full border border-primary/35 bg-primary px-8 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_16px_36px_rgba(232,113,48,0.24)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-[0_22px_48px_rgba(232,113,48,0.34)] active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 disabled:shadow-none"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-3">
                          <Loader2 className="size-4 animate-spin" />
                          Working
                        </span>
                      ) : mode === 'login' ? (
                        'Login'
                      ) : (
                        'Register'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default AuthPage

import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  Monitor,
  Server,
  Cpu,
  Cloud,
  Smartphone,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/* ─────────────────────────────────────────────
   Bento Card Sub-component
───────────────────────────────────────────── */
const expertiseLinks = {
  frontend: '/mentors?search=Frontend%20Engineering',
  backend: '/mentors?search=Backend%20Engineering',
  ai: '/mentors?search=AI%20Machine%20Learning',
  cloud: '/mentors?search=Cloud%20Infrastructure',
  mobile: '/mentors?search=Mobile%20Development',
}

function TechBadge({ children, className }) {
  return (
    <span
      className={cn(
        'rounded-full border border-foreground/10 bg-background/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.06] dark:text-white/30',
        className,
      )}
    >
      {children}
    </span>
  )
}

function FrontendVisual() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0 text-primary/70 opacity-[0.08] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:30px_30px]" />
      <div className="absolute -right-14 -top-16 h-72 w-72 rounded-full bg-primary/25 blur-[70px] transition-opacity duration-300 group-hover:opacity-90" />
      <div className="absolute left-24 top-12 h-44 w-72 rotate-[-10deg] rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/12 via-cyan-400/8 to-transparent shadow-[0_30px_80px_rgba(232,113,48,0.12)]" />

      <div className="absolute right-5 top-7 hidden w-60 overflow-hidden rounded-2xl border border-foreground/10 bg-background/35 shadow-2xl backdrop-blur-xl sm:block">
        <div className="flex items-center gap-1.5 border-b border-foreground/10 px-3 py-2">
          <span className="size-2 rounded-full bg-primary/60" />
          <span className="size-2 rounded-full bg-amber-300/40" />
          <span className="size-2 rounded-full bg-cyan-300/40" />
          <span className="ml-2 h-1.5 flex-1 rounded-full bg-foreground/10" />
        </div>
        <div className="grid grid-cols-[0.7fr_1fr] gap-3 p-3">
          <div className="space-y-2">
            <span className="block h-2 w-16 rounded-full bg-primary/35" />
            <span className="block h-2 w-12 rounded-full bg-foreground/15" />
            <span className="block h-14 rounded-xl border border-foreground/10 bg-foreground/[0.04]" />
          </div>
          <div className="space-y-2">
            <span className="block h-3 rounded-full bg-foreground/15" />
            <span className="block h-3 w-3/4 rounded-full bg-foreground/10" />
            <span className="block h-9 rounded-xl border border-primary/15 bg-primary/[0.08]" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-24 right-8 hidden w-44 rounded-2xl border border-foreground/10 bg-background/25 p-3 text-[10px] leading-relaxed text-foreground/35 shadow-xl backdrop-blur-md lg:block">
        <code>
          {'<MentorCard />'}
          <br />
          {'  <Stack tags />'}
          <br />
          {'  <BookCTA />'}
        </code>
      </div>

      <div className="absolute bottom-8 right-28 hidden items-start gap-2 text-foreground/30 lg:flex">
        <div className="mt-2 h-px w-8 bg-primary/30" />
        <div className="space-y-1.5">
          {['App', 'Layout', 'Card', 'Button'].map((node, index) => (
            <div key={node} className="flex items-center gap-2" style={{ marginLeft: `${index * 10}px` }}>
              <span className="size-1.5 rounded-full bg-primary/45" />
              <span className="rounded-md border border-foreground/10 bg-background/25 px-2 py-0.5 text-[10px] backdrop-blur-md">
                {node}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute left-7 top-24 hidden gap-2 sm:flex">
        <TechBadge>React</TechBadge>
        <TechBadge>TS</TechBadge>
      </div>
      <div className="absolute right-7 top-40 hidden gap-2 sm:flex">
        <TechBadge>Tailwind</TechBadge>
        <TechBadge>JS</TechBadge>
      </div>
      <div className="absolute left-8 bottom-28 hidden h-9 w-24 rounded-xl border border-primary/15 bg-primary/[0.08] shadow-[0_0_35px_rgba(232,113,48,0.18)] backdrop-blur-md sm:block" />
      <div className="absolute left-36 bottom-36 hidden h-8 w-20 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] backdrop-blur-md sm:block" />
    </div>
  )
}

function BackendVisual() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute inset-x-6 top-7 h-px bg-gradient-to-r from-transparent via-violet-300/25 to-transparent" />
      <div className="absolute right-5 top-8 rounded-full border border-violet-300/15 bg-violet-300/[0.08] px-3 py-1 text-[10px] font-medium text-foreground/30 backdrop-blur-md">
        API /v1
      </div>
      <div className="absolute left-6 top-16 grid gap-2">
        {['Gateway', 'Service', 'Queue'].map((item) => (
          <div key={item} className="h-7 w-24 rounded-lg border border-foreground/10 bg-background/25 px-3 py-1 text-[10px] text-foreground/30 backdrop-blur-md">
            {item}
          </div>
        ))}
      </div>
      <div className="absolute bottom-8 right-7 h-16 w-16 rounded-[50%] border border-violet-300/20 bg-violet-300/[0.06] shadow-[inset_0_-10px_18px_rgba(139,92,246,0.08)]">
        <div className="mx-auto mt-3 h-2 w-10 rounded-full border border-violet-300/20" />
        <div className="mx-auto mt-2 h-2 w-10 rounded-full border border-violet-300/15" />
      </div>
      <div className="absolute bottom-7 left-7 flex gap-2">
        <TechBadge>Node.js</TechBadge>
        <TechBadge>Python</TechBadge>
      </div>
      <svg className="absolute inset-0 h-full w-full text-violet-300/20" viewBox="0 0 260 208" fill="none">
        <path d="M74 91C118 91 118 48 178 48" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 6" />
        <path d="M98 119C145 119 151 151 197 151" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 6" />
      </svg>
    </div>
  )
}

function AiVisual() {
  const nodes = [
    [56, 58],
    [118, 36],
    [116, 102],
    [182, 66],
    [203, 132],
    [78, 150],
  ]

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute -right-12 top-2 h-44 w-44 rounded-full bg-emerald-400/15 blur-[55px]" />
      <svg className="absolute inset-0 h-full w-full text-emerald-300/25" viewBox="0 0 260 208" fill="none">
        {nodes.map(([x1, y1], i) =>
          nodes.slice(i + 1).map(([x2, y2]) => (
            <path key={`${x1}-${y1}-${x2}-${y2}`} d={`M${x1} ${y1}L${x2} ${y2}`} stroke="currentColor" strokeWidth="1" opacity="0.35" />
          )),
        )}
        {nodes.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="currentColor" />
        ))}
      </svg>
      <div className="absolute right-7 top-9 grid size-16 grid-cols-3 gap-1 rounded-2xl border border-emerald-300/15 bg-background/25 p-3 backdrop-blur-md">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="rounded-sm bg-emerald-300/20" />
        ))}
      </div>
      <div className="absolute bottom-8 left-7 flex gap-2">
        <TechBadge>LLM</TechBadge>
        <TechBadge>Vectors</TechBadge>
      </div>
      <div className="absolute bottom-12 right-8 h-2 w-24 rounded-full bg-gradient-to-r from-emerald-300/10 via-emerald-300/40 to-transparent" />
    </div>
  )
}

function CloudVisual() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute left-7 top-10 flex items-center gap-2">
        <span className="size-9 rounded-xl border border-orange-300/15 bg-orange-300/[0.08]" />
        <span className="h-px w-10 bg-orange-300/20" />
        <span className="size-11 rounded-full border border-orange-300/15 bg-background/25 backdrop-blur-md" />
        <span className="h-px w-10 bg-orange-300/20" />
        <span className="size-8 rounded-lg border border-orange-300/15 bg-orange-300/[0.06]" />
      </div>
      <div className="absolute right-7 top-20 rounded-2xl border border-foreground/10 bg-background/25 p-2 backdrop-blur-md">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((item) => (
            <span key={item} className="h-6 w-9 rounded-md bg-foreground/10" />
          ))}
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-primary/25" />
      </div>
      <div className="absolute bottom-8 left-7 flex flex-wrap gap-2">
        <TechBadge>Docker</TechBadge>
        <TechBadge>K8s</TechBadge>
        <TechBadge>AWS</TechBadge>
      </div>
      <div className="absolute bottom-10 right-8 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-foreground/25">
        {['Build', 'Test', 'Ship'].map((item) => (
          <React.Fragment key={item}>
            <span>{item}</span>
            {item !== 'Ship' ? <span className="h-px w-3 bg-primary/20" /> : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function MobileVisual() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute right-8 top-8 h-32 w-20 rounded-[1.5rem] border border-rose-300/20 bg-background/25 p-2 shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-2 h-1 w-6 rounded-full bg-foreground/15" />
        <div className="space-y-1.5">
          <div className="h-8 rounded-xl bg-rose-300/[0.08]" />
          <div className="h-2 rounded-full bg-foreground/15" />
          <div className="h-2 w-3/4 rounded-full bg-foreground/10" />
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <span className="h-6 rounded-lg bg-foreground/10" />
            <span className="h-6 rounded-lg bg-primary/15" />
          </div>
        </div>
      </div>
      <div className="absolute left-7 top-10 h-12 w-24 rounded-2xl border border-rose-300/15 bg-rose-300/[0.07] backdrop-blur-md" />
      <div className="absolute bottom-8 left-7 flex flex-wrap gap-2">
        <TechBadge>Flutter</TechBadge>
        <TechBadge>RN</TechBadge>
        <TechBadge>Swift</TechBadge>
        <TechBadge>Kotlin</TechBadge>
      </div>
      <svg className="absolute inset-0 h-full w-full text-rose-300/20" viewBox="0 0 260 208" fill="none">
        <path d="M73 84C104 116 136 64 171 96" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 7" />
        <path d="M91 134C126 112 150 151 190 124" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 7" />
      </svg>
    </div>
  )
}

function BentoCard({ icon, title, desc, className, glowClass, visual, href = '/mentors', featured = false }) {
  return (
    <Link
      to={href}
      className={cn(
        'group relative flex min-h-[13rem] cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card/65 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-card/80 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14),0_0_45px_rgba(232,113,48,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 dark:hover:shadow-[0_24px_70px_rgba(0,0,0,0.38),0_0_48px_rgba(232,113,48,0.16)]',
        className,
      )}
      aria-label={`Explore ${title} mentors`}
    >
      {/* Gradient accent overlay */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-0 bg-gradient-to-br opacity-55 transition-opacity duration-300 group-hover:opacity-80',
          glowClass,
        )}
      />
      {visual}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-card via-card/70 to-card/10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/2 bg-gradient-to-t from-background/35 to-transparent dark:from-background/25" />

      <span className="absolute right-5 top-5 z-20 flex size-8 translate-y-1 items-center justify-center rounded-full border border-primary/15 bg-background/30 text-primary opacity-0 shadow-[0_0_24px_rgba(232,113,48,0.14)] backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRight className="size-3.5" />
      </span>

      {/* Icon */}
      <div className="relative z-10 flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-background/45 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-all duration-300 group-hover:border-primary/25 group-hover:bg-primary/10 group-hover:text-primary">
        {icon}
      </div>

      {/* Text */}
      <div className="relative z-10 mt-5 max-w-[17rem]">
        <h3 className={cn('mb-2 font-semibold leading-tight tracking-tight text-foreground', featured ? 'text-2xl lg:text-3xl' : 'text-xl')}>
          {title}
        </h3>
        <p className={cn('text-sm font-medium leading-relaxed text-muted-foreground/95', featured && 'max-w-sm text-[0.95rem]')}>
          {desc}
        </p>
      </div>
    </Link>
  )
}

/* ─────────────────────────────────────────────
   Process Step
───────────────────────────────────────────── */
function ProcessStep({ step, title, desc, isLast }) {
  return (
    <div className="relative flex flex-col items-center text-center gap-5">
      {/* Connector line — between cards on desktop */}
      {!isLast && (
        <div className="hidden md:block absolute top-9 left-[calc(50%+2.5rem)] right-0 h-px bg-gradient-to-r from-border via-primary/30 to-transparent" />
      )}

      {/* Step bubble */}
      <div className="relative z-10 flex size-[4.5rem] items-center justify-center rounded-full border-2 border-border bg-background shadow-sm">
        <span className="text-xl font-bold text-primary">{step}</span>
      </div>

      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{desc}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   LandingPage
───────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="bg-background text-foreground overflow-hidden">
      {/* ────────────────────────────────────────
          Section A — Kinetic Hero
      ──────────────────────────────────────── */}
      <section
        id="hero"
        className="relative overflow-hidden pt-36 pb-20"
      >
        {/* Aurora background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-32 h-[45rem] w-[45rem] rounded-full bg-primary/10 blur-[140px]" />
          <div className="absolute top-1/3 -right-40 h-[38rem] w-[38rem] rounded-full bg-chart-1/8 blur-[130px]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-16">

          {/* ── Massive full-width headline ── */}
          <h1 className="mb-14 text-[clamp(3.5rem,10vw,6.5rem)] font-extrabold leading-[0.95] tracking-tight text-foreground">
            Accelerate Your Career<br />
            With Expert{' '}
            <span className="text-primary">Mentorship.</span>
          </h1>

          {/* ── Bottom two-column row ── */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">

            {/* Left — testimonial / social proof */}
            <div className="flex flex-col justify-between gap-8">
              {/* Stars */}
              <div>
                <div className="mb-4 flex gap-1" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="size-5 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="max-w-[22ch] text-sm leading-relaxed text-muted-foreground">
                  "My mentor helped me land a senior engineering role in 3 months.
                  The structured roadmap and weekly check-ins made all the difference."
                </blockquote>

                <p className="mt-3 text-xs font-medium text-foreground">
                  Sara K. — Frontend Engineer
                </p>
              </div>

              {/* Pagination dots */}
              <div className="flex items-center gap-2">
                <div className="h-1 w-6 rounded-full bg-primary" />
                <div className="h-1 w-3 rounded-full bg-border" />
                <div className="h-1 w-3 rounded-full bg-border" />
              </div>
            </div>

            {/* Right — description + paired CTA buttons */}
            <div className="flex flex-col justify-between gap-8">
              <p className="text-base leading-relaxed text-muted-foreground max-w-sm">
                Connect with industry professionals who've navigated the exact
                challenges you're facing. Our mentors have helped{' '}
                <span className="font-medium text-foreground">10,000+ learners</span>{' '}
                reach their next milestone.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                <Button
                  asChild
                  size="lg"
                  className="w-full justify-center border border-primary/30 px-7 shadow-[0_16px_36px_rgba(232,113,48,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(232,113,48,0.34)] sm:w-auto sm:min-w-44"
                >
                  <Link to="/mentors">Find a Mentor</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full justify-center border-border/70 bg-background/40 px-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/10 hover:text-foreground hover:shadow-[0_18px_42px_rgba(232,113,48,0.14)] sm:w-auto sm:min-w-44"
                >
                  <Link to="/login">Get Started Free</Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ────────────────────────────────────────
          Section B — Trust Metrics Band
      ──────────────────────────────────────── */}
      <section
        id="metrics"
        className="border-y border-border py-20"
        aria-label="Platform statistics"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.4fr] md:gap-20">

            {/* Left — narrative copy */}
            <div className="flex flex-col justify-center gap-5 text-sm leading-relaxed text-muted-foreground max-w-sm">
              <p>
                Mentorship is undergoing its biggest shift in a generation.
                Learners who work with the right guide are already landing roles
                faster — and with far greater confidence.
              </p>
              <p>
                MentHub is built on that belief. Our platform connects you with
                verified experts so you can focus on what actually moves your
                career forward.
              </p>
            </div>

            {/* Right — stacked metric rows */}
            <div className="flex flex-col">
              {[
                { value: '500+', desc: 'verified expert mentors across every major tech domain' },
                { value: '10k+', desc: 'sessions completed — with a 95 % goal-achievement rate' },
                { value: '4.9★', desc: 'average mentor rating from thousands of learner reviews' },
              ].map(({ value, desc }) => (
                <div
                  key={value}
                  className="flex items-baseline justify-between gap-6 border-t border-border py-6 first:border-t-0"
                >
                  {/* Big value */}
                  <span className="text-[clamp(2.8rem,6vw,4rem)] font-extrabold leading-none tracking-tight text-primary">
                    {value}
                  </span>
                  {/* Right-aligned descriptor */}
                  <span className="max-w-[14rem] text-right text-xs leading-relaxed text-muted-foreground">
                    {desc}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────
          Section C — Bento Grid (Master Your Stack)
      ──────────────────────────────────────── */}
      <section id="stack" className="relative py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-1/4 h-[30rem] w-[30rem] rounded-full bg-chart-1/8 blur-[110px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-16">
          {/* Section header */}
          <div className="mb-16">
            <p className="mb-4 text-xs uppercase tracking-[0.45em] text-muted-foreground">
              Domain Expertise
            </p>
            <h2 className="text-4xl font-bold uppercase tracking-tight text-foreground lg:text-5xl">
              Master Your Stack
            </h2>
          </div>

          {/* Asymmetrical bento grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6 [grid-auto-rows:13rem]">
            {/* Frontend — large (2 cols × 2 rows) */}
            <BentoCard
              className="lg:col-span-2 lg:row-span-2"
              icon={<Monitor className="size-5" />}
              title="Frontend Engineering"
              desc="React, Vue, TypeScript, CSS architecture, Web Performance & Accessibility."
              glowClass="from-primary/18 via-cyan-400/10 to-transparent"
              href={expertiseLinks.frontend}
              visual={<FrontendVisual />}
              featured
            />

            {/* Backend */}
            <BentoCard
              icon={<Server className="size-5" />}
              title="Backend Engineering"
              desc="Node.js, Python, REST & GraphQL APIs, databases & system design."
              glowClass="from-violet-500/16 via-primary/8 to-transparent"
              href={expertiseLinks.backend}
              visual={<BackendVisual />}
            />

            {/* AI / ML */}
            <BentoCard
              icon={<Cpu className="size-5" />}
              title="AI & Machine Learning"
              desc="PyTorch, LLMs, MLOps pipelines, and applied research."
              glowClass="from-emerald-500/16 via-cyan-300/8 to-transparent"
              href={expertiseLinks.ai}
              visual={<AiVisual />}
            />

            {/* Infrastructure */}
            <BentoCard
              icon={<Cloud className="size-5" />}
              title="Cloud & Infrastructure"
              desc="AWS, GCP, Kubernetes, DevOps, CI/CD and Infrastructure-as-Code."
              glowClass="from-orange-400/18 via-primary/8 to-transparent"
              href={expertiseLinks.cloud}
              visual={<CloudVisual />}
            />

            {/* Mobile */}
            <BentoCard
              icon={<Smartphone className="size-5" />}
              title="Mobile Development"
              desc="React Native, Swift, Kotlin, and Flutter for cross-platform apps."
              glowClass="from-rose-500/16 via-primary/8 to-transparent"
              href={expertiseLinks.mobile}
              visual={<MobileVisual />}
            />
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────
          Section D — The Process
      ──────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="relative border-y border-border bg-muted/20 py-28"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          {/* Section header */}
          <div className="mb-20 text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.45em] text-muted-foreground">
              Simple Process
            </p>
            <h2 className="text-4xl font-bold uppercase tracking-tight text-foreground lg:text-5xl">
              How It Works
            </h2>
          </div>

          {/* Steps grid */}
          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            <ProcessStep
              step="01"
              title="Browse Mentors"
              desc="Explore our curated roster of verified industry professionals across every major tech domain."
            />
            <ProcessStep
              step="02"
              title="Book a Session"
              desc="Schedule a 1-on-1 session at a time that works for you — sessions are flexible and goal-driven."
            />
            <ProcessStep
              step="03"
              title="Grow Together"
              desc="Receive personalized guidance, code reviews, career advice, and a clear roadmap to your next milestone."
              isLast
            />
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────
          Section E — Final CTA Push
      ──────────────────────────────────────── */}
      <section id="cta" className="relative overflow-hidden py-28">
        {/* Soft background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[35rem] w-[50rem] -translate-x-1/2 rounded-full bg-primary/8 blur-[130px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6">

          {/* ── Top: icon + heading + subtitle ── */}
          <div className="mb-16 text-center">
            {/* Abstract icon cluster */}
            <div className="mb-8 inline-flex items-end justify-center gap-1" aria-hidden="true">
              {/* Book stack */}
              <div className="flex flex-col items-center gap-0.5">
                {[80, 72, 64].map((w, i) => (
                  <div
                    key={i}
                    className="h-2.5 rounded-sm border border-primary/30 bg-primary/15"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              {/* Lightning bolt */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="-ml-3 -mt-6 size-8 text-primary"
              >
                <path d="M13 2L4.09 12.97A1 1 0 005 14.5h5.5L10 22l9.5-10.5A1 1 0 0018.5 10H13l.5-8z" />
              </svg>
            </div>

            <h2 className="mx-auto max-w-2xl text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl">
              Accelerate your career with<br />
              <span className="text-primary">the right mentor</span>
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              Ready to reach your next level? Book a session with a verified
              industry expert today.
            </p>
          </div>

          {/* ── Bottom: split preview card ── */}
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-2xl md:flex">

            {/* Left — dashboard preview */}
            <div className="relative min-h-[280px] flex-1 overflow-hidden bg-muted/30 md:min-h-[360px]">
              {/* Fake browser chrome */}
              <div className="absolute inset-0 flex flex-col">
                <div className="flex items-center gap-1.5 border-b border-border/60 bg-card/80 px-4 py-2.5">
                  <div className="size-2.5 rounded-full bg-destructive/60" />
                  <div className="size-2.5 rounded-full bg-primary/40" />
                  <div className="size-2.5 rounded-full bg-chart-2/60" />
                  <div className="ml-3 flex-1 rounded-full bg-muted/60 py-0.5 px-3 text-[10px] text-muted-foreground">
                    menthub.io/dashboard
                  </div>
                </div>
                {/* Fake dashboard content */}
                <div className="flex-1 p-4 space-y-2.5 overflow-hidden">
                  <div className="flex gap-3">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="h-2 w-20 rounded bg-muted-foreground/20" />
                      <div className="h-2 w-28 rounded bg-muted-foreground/15" />
                    </div>
                    <div className="h-6 w-16 rounded-full bg-primary/30" />
                  </div>
                  {[90, 75, 60, 80, 65, 50].map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-muted-foreground/15 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 rounded bg-muted-foreground/20" style={{ width: `${w}%` }} />
                        <div className="h-1.5 rounded bg-muted-foreground/12" style={{ width: `${w * 0.6}%` }} />
                      </div>
                      <div className="h-5 w-12 rounded-full bg-border/60" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Gradient fade on right edge */}
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-card/60 to-transparent" />
            </div>

            {/* Right — checklist + CTA */}
            <div className="flex flex-col justify-between gap-8 bg-card/80 p-8 md:w-72 lg:w-80 shrink-0">
              <div>
                <p className="mb-5 text-sm font-semibold text-foreground">
                  We'd love to talk to you about
                </p>
                <ul className="space-y-3">
                  {[
                    'Personalised 1-on-1 mentorship',
                    'Expert guidance across 50+ domains',
                    'Loved by 10,000+ learners',
                    'How we help you reach your goals',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      >
                        <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA + avatars */}
              <div className="space-y-4">
                <Button asChild size="lg" className="w-full gap-2">
                  <Link to="/login">
                    Get Started Free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>

                {/* Avatar stack */}
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {['S', 'A', 'R', 'M'].map((initial, i) => (
                      <div
                        key={i}
                        className="inline-flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary/20 text-[10px] font-bold text-primary ring-0"
                        aria-hidden="true"
                      >
                        {initial}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">
                    500+ mentors<br />ready to help
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

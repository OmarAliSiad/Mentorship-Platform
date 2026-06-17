import * as React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Blocks, ChartNoAxesColumn, LayoutDashboard, LogOut, ShieldCheck, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5005/api'
const pageSize = 8

async function api(path, options = {}) {
  const token = useAuthStore.getState().user?.token
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'Request failed')
  return data
}

function Shell({ children }) {
  const logout = useAuthStore((state) => state.logout)
  const nav = [
    ['Dashboard', '/admin', LayoutDashboard],
    ['Users', '/admin/users', Users],
    ['Stacks', '/admin/stacks', Blocks],
    ['Statistics', '/admin/statistics', ChartNoAxesColumn],
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen md:grid-cols-[16rem_1fr]">
        <aside className="border-b border-border bg-card/70 p-4 md:border-b-0 md:border-r">
          <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck className="size-5 text-primary" /> Admin
          </div>
          <nav className="flex gap-2 overflow-x-auto md:flex-col">
            {nav.map(([label, to, Icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground',
                    isActive && 'bg-muted text-foreground',
                  )
                }
              >
                <Icon className="size-4" /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section>
          <header className="flex items-center justify-between border-b border-border px-4 py-4 md:px-8">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Academic Mentorship</p>
              <h1 className="text-xl font-semibold">Admin Console</h1>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="size-4" /> Logout
            </Button>
          </header>
          <div className="p-4 md:p-8">{children}</div>
        </section>
      </div>
    </main>
  )
}

function LoadingRows({ rows = 4 }) {
  return Array.from({ length: rows }, (_, index) => <Skeleton key={index} className="h-12 w-full" />)
}

function EmptyState({ children }) {
  return <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{children}</div>
}

function ConfirmDialog({ action, onCancel, onConfirm }) {
  if (!action) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-md border border-border bg-card p-5 shadow-lg">
        <h2 className="font-semibold">Confirm change</h2>
        <p className="mt-2 text-sm text-muted-foreground">{action.label}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = React.useState(null)
  React.useEffect(() => { api('/admin/statistics').then(setStats).catch((error) => toast.error(error.message)) }, [])
  const cards = [
    ['Total Users', stats?.totalUsers],
    ['Total Mentors', stats?.totalMentors],
    ['Total Students', stats?.totalStudents],
    ['Total Sessions', stats?.totalSessions],
    ['Technical Stacks', stats?.totalStacks],
  ]
  return <Cards items={cards} loading={!stats} />
}

function Statistics() {
  const [stats, setStats] = React.useState(null)
  React.useEffect(() => { api('/admin/statistics').then(setStats).catch((error) => toast.error(error.message)) }, [])
  return <Cards items={[
    ['Scheduled Sessions', stats?.scheduledSessions],
    ['Completed Sessions', stats?.completedSessions],
    ['Canceled Sessions', stats?.canceledSessions],
  ]} loading={!stats} />
}

function Cards({ items, loading }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? <Skeleton className="mt-4 h-9 w-20" /> : <p className="mt-3 text-3xl font-semibold">{value ?? 0}</p>}
        </div>
      ))}
    </div>
  )
}

function UsersPage() {
  const [users, setUsers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [action, setAction] = React.useState(null)

  React.useEffect(() => {
    api('/admin/users').then(setUsers).catch((error) => toast.error(error.message)).finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((user) => `${user.name || ''} ${user.email} ${user.role} ${user.status}`.toLowerCase().includes(query.toLowerCase()))
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)

  const updateStatus = async () => {
    try {
      const user = await api(`/admin/users/${action.user._id}/status`, { method: 'PUT', body: JSON.stringify({ status: action.status }) })
      setUsers((current) => current.map((item) => (item._id === user._id ? user : item)))
      toast.success('User updated')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setAction(null)
    }
  }

  return (
    <Panel title="Users" query={query} setQuery={(value) => { setQuery(value); setPage(1) }}>
      {loading ? <LoadingRows /> : visible.length ? (
        <Table heads={['Name', 'Email', 'Role', 'Status', 'Actions']}>
          {visible.map((user) => (
            <tr key={user._id} className="border-t border-border">
              <td className="p-3">{user.name || user.email?.split('@')[0]}</td>
              <td className="p-3 text-muted-foreground">{user.email}</td>
              <td className="p-3">{user.role}</td>
              <td className="p-3 capitalize">{user.status || 'approved'}</td>
              <td className="flex flex-wrap gap-2 p-3">
                {user.role === 'Mentor' && user.status !== 'approved' ? <Button size="sm" onClick={() => setAction({ user, status: 'approved', label: `Approve ${user.email}?` })}>Approve</Button> : null}
                {user.status === 'blocked'
                  ? <Button size="sm" variant="outline" onClick={() => setAction({ user, status: 'approved', label: `Unblock ${user.email}?` })}>Unblock</Button>
                  : <Button size="sm" variant="destructive" onClick={() => setAction({ user, status: 'blocked', label: `Block ${user.email}?` })}>Block</Button>}
              </td>
            </tr>
          ))}
        </Table>
      ) : <EmptyState>No users found.</EmptyState>}
      <Pager page={page} pages={pages} setPage={setPage} />
      <ConfirmDialog action={action} onCancel={() => setAction(null)} onConfirm={updateStatus} />
    </Panel>
  )
}

function StacksPage() {
  const [stacks, setStacks] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [form, setForm] = React.useState({ name: '', description: '' })
  const [editing, setEditing] = React.useState(null)
  const [action, setAction] = React.useState(null)

  const load = () => api('/stacks').then(setStacks).catch((error) => toast.error(error.message)).finally(() => setLoading(false))
  React.useEffect(load, [])

  const save = async (event) => {
    event.preventDefault()
    try {
      await api(editing ? `/stacks/${editing}` : '/stacks', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) })
      setForm({ name: '', description: '' })
      setEditing(null)
      setLoading(true)
      load()
      toast.success('Stack saved')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const remove = async () => {
    try {
      await api(`/stacks/${action._id}`, { method: 'DELETE' })
      setStacks((current) => current.filter((stack) => stack._id !== action._id))
      toast.success('Stack deleted')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setAction(null)
    }
  }

  return (
    <Panel title="Technical Stacks">
      <form onSubmit={save} className="mb-6 grid gap-3 rounded-md border border-border bg-card p-4 md:grid-cols-[1fr_2fr_auto]">
        <input className="rounded-md border border-input bg-background px-3 py-2" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <input className="rounded-md border border-input bg-background px-3 py-2" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
      </form>
      {loading ? <LoadingRows /> : stacks.length ? (
        <Table heads={['Name', 'Description', 'Actions']}>
          {stacks.map((stack) => (
            <tr key={stack._id} className="border-t border-border">
              <td className="p-3">{stack.name}</td>
              <td className="p-3 text-muted-foreground">{stack.description || '-'}</td>
              <td className="flex gap-2 p-3">
                <Button size="sm" variant="outline" onClick={() => { setEditing(stack._id); setForm({ name: stack.name, description: stack.description || '' }) }}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => setAction(stack)}>Delete</Button>
              </td>
            </tr>
          ))}
        </Table>
      ) : <EmptyState>No stacks yet.</EmptyState>}
      <ConfirmDialog action={action && { label: `Delete ${action.name}?` }} onCancel={() => setAction(null)} onConfirm={remove} />
    </Panel>
  )
}

function Panel({ title, query, setQuery, children }) {
  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {setQuery ? <input className="rounded-md border border-input bg-background px-3 py-2" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} /> : null}
      </div>
      {children}
    </section>
  )
}

function Table({ heads, children }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-card">
      <table className="w-full min-w-[42rem] text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>{heads.map((head) => <th key={head} className="p-3 font-medium">{head}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Pager({ page, pages, setPage }) {
  return pages > 1 ? (
    <div className="mt-4 flex items-center justify-end gap-2">
      <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
      <span className="text-sm text-muted-foreground">{page} / {pages}</span>
      <Button variant="outline" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</Button>
    </div>
  ) : null
}

export default function AdminDashboard() {
  const { pathname } = useLocation()
  const page = pathname.endsWith('/users') ? <UsersPage /> : pathname.endsWith('/stacks') ? <StacksPage /> : pathname.endsWith('/statistics') ? <Statistics /> : <Dashboard />
  return <Shell>{page}</Shell>
}

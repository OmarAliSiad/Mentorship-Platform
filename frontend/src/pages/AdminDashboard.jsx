import * as React from 'react'
import { Blocks, ChartNoAxesColumn, LayoutDashboard, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
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

// ─── Shared primitives ────────────────────────────────────────────────────────

function LoadingRows({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-2xl" />
      ))}
    </div>
  )
}

function EmptyState({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-subtle bg-muted/20 p-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-xl font-semibold mb-6 text-foreground">{children}</h2>
}

function AdminInput({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${className}`}
      {...props}
    />
  )
}

function ConfirmDialog({ action, onCancel, onConfirm }) {
  if (!action) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-sm p-6 shadow-xl">
        <h2 className="font-semibold text-lg text-foreground mb-2">Confirm action</h2>
        <p className="text-sm text-muted-foreground">{action.label}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-full border border-border-subtle text-foreground hover:bg-muted transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary px-5 py-2"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────

function StatCard({ label, value, loading }) {
  return (
    <div className="glass-panel p-6">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">{label}</p>
      {loading
        ? <Skeleton className="h-10 w-24 rounded-xl mt-1" />
        : <p className="text-4xl font-bold text-foreground">{value ?? 0}</p>
      }
    </div>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function Overview() {
  const [stats, setStats] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    api('/admin/statistics')
      .then(setStats)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    ['Total Users', stats?.totalUsers],
    ['Total Mentors', stats?.totalMentors],
    ['Total Students', stats?.totalStudents],
    ['Total Sessions', stats?.totalSessions],
    ['Tech Stacks', stats?.totalStacks],
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <StatCard key={label} label={label} value={value} loading={loading} />
        ))}
      </div>
    </div>
  )
}

// ─── Statistics tab ───────────────────────────────────────────────────────────

function Statistics() {
  const [stats, setStats] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    api('/admin/statistics')
      .then(setStats)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    ['Scheduled Sessions', stats?.scheduledSessions],
    ['Completed Sessions', stats?.completedSessions],
    ['Canceled Sessions', stats?.canceledSessions],
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map(([label, value]) => (
        <StatCard key={label} label={label} value={value} loading={loading} />
      ))}
    </div>
  )
}

// ─── Users tab ────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  approved: 'bg-green-500/15 text-green-400 border border-green-500/20',
  pending:  'bg-primary/10 text-primary border border-primary/20',
  blocked:  'bg-destructive/15 text-destructive border border-destructive/20',
}

function UsersPage() {
  const [users, setUsers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [action, setAction] = React.useState(null)

  React.useEffect(() => {
    api('/admin/users')
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((u) =>
    `${u.name || ''} ${u.email} ${u.role} ${u.status}`.toLowerCase().includes(query.toLowerCase())
  )
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)

  const updateStatus = async () => {
    try {
      const updated = await api(`/admin/users/${action.user._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: action.status }),
      })
      setUsers((cur) => cur.map((u) => (u._id === updated._id ? updated : u)))
      toast.success('User updated')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAction(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionTitle>Users</SectionTitle>
        <AdminInput
          className="sm:w-64"
          placeholder="Search users..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1) }}
        />
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6">
                    <LoadingRows />
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6">
                    <EmptyState>No users found.</EmptyState>
                  </td>
                </tr>
              ) : (
                visible.map((u) => (
                  <tr key={u._id} className="border-t border-border-subtle hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">
                      {u.name || u.email?.split('@')[0]}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border-subtle">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[u.status] || STATUS_STYLES.approved}`}>
                        {u.status || 'approved'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {u.role === 'Mentor' && u.status !== 'approved' && (
                          <button
                            onClick={() => setAction({ user: u, status: 'approved', label: `Approve ${u.email}?` })}
                            className="text-xs px-4 py-2 rounded-full bg-green-500/15 text-green-400 hover:bg-green-500 hover:text-white transition-colors font-medium border border-green-500/20"
                          >
                            Approve
                          </button>
                        )}
                        {u.status === 'blocked' ? (
                          <button
                            onClick={() => setAction({ user: u, status: 'approved', label: `Unblock ${u.email}?` })}
                            className="text-xs px-4 py-2 rounded-full border border-border-subtle text-foreground hover:bg-muted transition-colors font-medium"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => setAction({ user: u, status: 'blocked', label: `Block ${u.email}?` })}
                            className="text-xs px-4 py-2 rounded-full bg-destructive/15 text-destructive hover:bg-destructive hover:text-white transition-colors font-medium border border-destructive/20"
                          >
                            Block
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-full border border-border-subtle text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground px-2">
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-4 py-2 rounded-full border border-border-subtle text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog action={action} onCancel={() => setAction(null)} onConfirm={updateStatus} />
    </div>
  )
}

// ─── Stacks tab ───────────────────────────────────────────────────────────────

function StacksPage() {
  const [stacks, setStacks] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [form, setForm] = React.useState({ name: '', description: '' })
  const [editing, setEditing] = React.useState(null)
  const [action, setAction] = React.useState(null)

  const load = () => {
    setLoading(true)
    api('/stacks')
      .then((data) => setStacks(Array.isArray(data) ? data : []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }

  React.useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    try {
      await api(editing ? `/stacks/${editing}` : '/stacks', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      })
      setForm({ name: '', description: '' })
      setEditing(null)
      load()
      toast.success(editing ? 'Stack updated' : 'Stack created')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const remove = async () => {
    try {
      await api(`/stacks/${action._id}`, { method: 'DELETE' })
      setStacks((cur) => cur.filter((s) => s._id !== action._id))
      toast.success('Stack deleted')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAction(null)
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle>Technical Stacks</SectionTitle>

      {/* Create / Edit form */}
      <div className="glass-panel p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">
          {editing ? 'Edit Stack' : 'Add New Stack'}
        </p>
        <form onSubmit={save} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
          <AdminInput
            placeholder="Stack name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <AdminInput
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary px-6 py-3 whitespace-nowrap">
              {editing ? 'Update' : 'Create'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => { setEditing(null); setForm({ name: '', description: '' }) }}
                className="px-6 py-3 rounded-full border border-border-subtle text-foreground hover:bg-muted transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Stacks list */}
      {loading ? (
        <LoadingRows />
      ) : stacks.length === 0 ? (
        <EmptyState>No stacks yet. Add your first one above.</EmptyState>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  {['Name', 'Description', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stacks.map((s) => (
                  <tr key={s._id} className="border-t border-border-subtle hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">{s.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{s.description || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditing(s._id); setForm({ name: s.name, description: s.description || '' }) }}
                          className="text-xs px-4 py-2 rounded-full border border-border-subtle text-foreground hover:bg-muted transition-colors font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setAction(s)}
                          className="text-xs px-4 py-2 rounded-full bg-destructive/15 text-destructive hover:bg-destructive hover:text-white transition-colors font-medium border border-destructive/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        action={action && { label: `Delete the "${action.name}" stack? This cannot be undone.` }}
        onCancel={() => setAction(null)}
        onConfirm={remove}
      />
    </div>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',    label: 'Overview',    Icon: LayoutDashboard },
  { id: 'users',       label: 'Users',       Icon: Users           },
  { id: 'stacks',      label: 'Stacks',      Icon: Blocks          },
  { id: 'statistics',  label: 'Statistics',  Icon: ChartNoAxesColumn },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState('overview')

  const page =
    activeTab === 'users'      ? <UsersPage />   :
    activeTab === 'stacks'     ? <StacksPage />  :
    activeTab === 'statistics' ? <Statistics />  :
                                 <Overview />

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 max-w-7xl">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter text-primary mb-2">
            Admin Console
          </h1>
          <p className="text-muted-foreground text-base">Manage users, stacks, and platform health</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border/60 mb-8 gap-1 overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 uppercase tracking-wider font-semibold text-sm transition-all rounded-full whitespace-nowrap ${
              activeTab === id
                ? 'text-primary bg-primary/10 border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>{page}</div>
    </div>
  )
}

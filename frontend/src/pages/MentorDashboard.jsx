import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

const MentorDashboard = () => {
  const logout = useAuthStore((state) => state.logout)

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">MentorDashboard</h1>
        <Button variant="outline" onClick={logout}>
          <LogOut className="size-4" /> Logout
        </Button>
      </div>
    </main>
  )
}

export default MentorDashboard

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const token = user?.token;
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5005/api/student/sessions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch (err) {
        toast.error('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSessions();
  }, [token]);

  const handleCancel = async (id) => {
    try {
      const res = await fetch(`http://localhost:5005/api/student/sessions/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSessions(sessions.map(s => s._id === id ? { ...s, status: 'canceled' } : s));
        toast.success('Session canceled successfully');
      } else {
        toast.error('Failed to cancel session');
      }
    } catch (err) {
      toast.error('Error canceling session');
    }
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 max-w-5xl">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 uppercase tracking-tighter text-orange-500">My Tailored Workspace</h1>
      
      {loading ? (
        <div className="text-muted-foreground text-center py-12 animate-pulse">Loading workspace...</div>
      ) : sessions.length === 0 ? (
        <div className="glass-panel p-16 text-center text-muted-foreground border-dashed flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-surface-base flex items-center justify-center mb-4 text-2xl">📅</div>
          <p className="text-lg">You haven't booked any sessions yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {sessions.map(session => (
            <div key={session._id} className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-xl">{session.mentor_id?.name || 'Unknown Mentor'}</h3>
                  <span className={`text-xs px-2 py-1 rounded-pill uppercase tracking-wider font-semibold ${
                    session.status === 'scheduled' ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30' : 
                    session.status === 'canceled' ? 'bg-destructive/20 text-destructive border border-destructive/30' : 
                    'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {session.status}
                  </span>
                </div>
                
                <p className="text-muted-foreground font-mono text-sm mb-3">
                  {new Date(session.scheduled_date).toLocaleDateString()} | {session.start_time} - {session.end_time}
                </p>
                
                {session.submission_description && (
                  <div className="bg-surface-base p-4 rounded-lg border border-border-subtle">
                    <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-1">Context</p>
                    <p className="text-sm text-primary leading-relaxed">{session.submission_description}</p>
                  </div>
                )}
                {session.mentor_notes && (
                  <div className="mt-4 bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <p className="text-xs uppercase text-accent-primary font-semibold tracking-wider mb-1">Evaluation Notes</p>
                    <p className="text-sm text-primary leading-relaxed">{session.mentor_notes}</p>
                  </div>
                )}
              </div>
              
              {session.status === 'scheduled' && (
                <button 
                  onClick={() => handleCancel(session._id)}
                  className="w-full md:w-auto px-6 py-3 rounded-pill bg-destructive/10 text-destructive font-medium border border-destructive/30 hover:bg-destructive hover:text-white transition-colors"
                >
                  Cancel Session
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

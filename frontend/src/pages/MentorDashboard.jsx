import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

const MentorDashboard = () => {
  const { user } = useAuthStore();
  const token = user?.token;
  const [activeTab, setActiveTab] = useState('sessions');

  // State
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);

  const [newDay, setNewDay] = useState('Monday');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  const [notesDraft, setNotesDraft] = useState({});

  const [stacks, setStacks] = useState([]);
  const [selectedStack, setSelectedStack] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profRes, availRes, sessRes, stackRes, histRes] = await Promise.all([
          fetch('http://localhost:5005/api/mentor/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5005/api/mentor/availability', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5005/api/mentor/sessions', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5005/api/stacks', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5005/api/mentor/sessions/history', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (profRes.ok) {
          const pData = await profRes.json();
          if (pData.mentor) {
            setProfile(pData.mentor);
            setName(pData.mentor.name || '');
            setTitle(pData.mentor.title || '');
            setBio(pData.mentor.bio || '');
            setHourlyRate(pData.mentor.hourly_rate || 0);
            setSelectedStack(pData.mentor.stack?._id || '');
          } else {
            setActiveTab('profile');
          }
        } else {
          setActiveTab('profile');
        }
        
        if (availRes.ok) {
          const aData = await availRes.json();
          setAvailability(aData.availability);
        }

        if (sessRes.ok) {
          const sData = await sessRes.json();
          // Filter to only show scheduled sessions in the sessions tab
          setSessions(sData.sessions.filter(s => s.status === 'scheduled'));
        }

        if (histRes.ok) {
          const hData = await histRes.json();
          setHistory(hData.sessions);
        }

        if (stackRes.ok) {
          const stData = await stackRes.json();
          setStacks(stData);
        }
      } catch (err) {
        toast.error('Failed to load mentor workspace');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  // Profile Handlers
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!selectedStack) return toast.error('Please select a Stack');
    try {
      const res = await fetch('http://localhost:5005/api/mentor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, title, bio, hourly_rate: hourlyRate, stack_id: selectedStack })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(profile ? 'Profile updated' : 'Profile created successfully!');
        setProfile(data.mentor);
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  // Availability Handlers
  const handleAddAvailability = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5005/api/mentor/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ day_of_week: newDay, start_time: newStart, end_time: newEnd })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Slot added');
        setAvailability([...availability, data.availability]);
      } else {
        toast.error(data.message || 'Failed to add slot');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleDeleteAvailability = async (id) => {
    try {
      const res = await fetch(`http://localhost:5005/api/mentor/availability/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Slot deleted');
        setAvailability(availability.filter(a => a._id !== id));
      } else {
        toast.error('Failed to delete slot');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  // Session Handlers
  const handleUpdateSessionStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5005/api/mentor/sessions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Session ${status}`);
        
        setSessions(prev => {
          const targetSession = prev.find(s => s._id === id);
          if (targetSession) {
            const updatedSession = { ...data.session, student_id: targetSession.student_id };
            
            setHistory(prevHist => {
              return [updatedSession, ...prevHist].sort((a, b) => {
                const dateA = new Date(`${a.scheduled_date.split('T')[0]}T${a.start_time}`);
                const dateB = new Date(`${b.scheduled_date.split('T')[0]}T${b.start_time}`);
                return dateB - dateA;
              });
            });
          }
          return prev.filter(s => s._id !== id);
        });

      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleUpdateNotes = async (id) => {
    try {
      const existingSession = sessions.find(s => s._id === id) || history.find(s => s._id === id);
      const notesToSave = notesDraft[id] !== undefined ? notesDraft[id] : (existingSession?.mentor_notes || '');

      const res = await fetch(`http://localhost:5005/api/mentor/sessions/${id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ mentor_notes: notesToSave })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Notes saved');
        setSessions(prev => prev.map(s => s._id === id ? { ...s, mentor_notes: notesToSave } : s));
        setHistory(prev => prev.map(s => s._id === id ? { ...s, mentor_notes: notesToSave } : s));
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter text-orange-500">Mentor Workspace</h1>
      </div>

      <div className="flex border-b border-border-subtle mb-8">
        {['profile', 'availability', 'sessions', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={!profile && tab !== 'profile'}
            className={`px-6 py-3 uppercase tracking-wider font-semibold text-sm transition-colors ${
              !profile && tab !== 'profile' ? 'opacity-50 cursor-not-allowed text-muted-foreground' :
              activeTab === tab ? 'text-orange-500 border-b-2 border-orange-500 bg-surface-hover' : 'text-muted-foreground hover:text-white hover:bg-surface-base'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse">Loading workspace...</div>
      ) : (
        <div className="space-y-8">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="glass-panel p-8">
              {!profile && (
                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-500">
                  Welcome to MentHub! Please initialize your profile to start accepting sessions.
                </div>
              )}
              <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface-base border border-border-subtle rounded-md px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Title</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-surface-base border border-border-subtle rounded-md px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Technology Stack</label>
                  <select required value={selectedStack} onChange={e => setSelectedStack(e.target.value)} className="w-full bg-surface-base border border-border-subtle rounded-md px-4 py-2 text-white">
                    <option value="" disabled className="bg-zinc-900 text-white">Select your primary stack...</option>
                    {stacks.map(s => <option key={s._id} value={s._id} className="bg-zinc-900 text-white">{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Hourly Rate ($)</label>
                  <input type="number" required value={hourlyRate} onChange={e => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-surface-base border border-border-subtle rounded-md px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Bio</label>
                  <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-surface-base border border-border-subtle rounded-md px-4 py-2 text-white"></textarea>
                </div>
                <button type="submit" className="bg-orange-500 text-white font-medium rounded-pill px-5 py-2 transition-transform active:scale-95 mt-4">{profile ? 'Update Profile' : 'Initialize Profile'}</button>
              </form>
            </div>
          )}

          {/* AVAILABILITY TAB */}
          {activeTab === 'availability' && profile && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-panel p-8">
                <h2 className="text-xl font-semibold mb-4">Add New Slot</h2>
                <form onSubmit={handleAddAvailability} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase text-muted-foreground mb-1">Day of Week</label>
                    <select value={newDay} onChange={e => setNewDay(e.target.value)} className="w-full bg-surface-base border border-border-subtle rounded-md px-4 py-2 text-white">
                      {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d} value={d} className="bg-zinc-900 text-white">{d}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs uppercase text-muted-foreground mb-1">Start Time</label>
                      <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} required className="w-full bg-surface-base border border-border-subtle rounded-md px-4 py-2 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs uppercase text-muted-foreground mb-1">End Time</label>
                      <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} required className="w-full bg-surface-base border border-border-subtle rounded-md px-4 py-2 text-white" />
                    </div>
                  </div>
                  <button type="submit" className="bg-orange-500 text-white font-medium rounded-pill px-5 py-2 transition-transform active:scale-95 w-full mt-2">Add Time Slot</button>
                </form>
              </div>

              <div className="glass-panel p-8">
                <h2 className="text-xl font-semibold mb-4">Current Availability</h2>
                {availability.length === 0 ? <p className="text-muted-foreground">No slots configured.</p> : (
                  <ul className="space-y-2">
                    {availability.map(slot => (
                      <li key={slot._id} className="flex justify-between items-center p-3 bg-surface-base border border-border-subtle rounded-lg">
                        <span className="font-semibold text-white">{slot.day_of_week}</span>
                        <span className="text-orange-500 font-mono text-sm">{slot.start_time} - {slot.end_time}</span>
                        <button onClick={() => handleDeleteAvailability(slot._id)} className="text-destructive text-sm hover:underline">Delete</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* SESSIONS TAB */}
          {activeTab === 'sessions' && profile && (
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="glass-panel p-12 text-center text-muted-foreground">No incoming sessions.</div>
              ) : (
                sessions.map(session => (
                  <div key={session._id} className="glass-panel p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-white">Session with {session.student_id?.name || 'Student'}</h3>
                        <p className="text-muted-foreground font-mono text-sm">{new Date(session.scheduled_date).toLocaleDateString()} | {session.start_time} - {session.end_time}</p>
                      </div>
                      <div className="mt-2 md:mt-0 flex items-center gap-2">
                        <span className={`px-3 py-1 text-xs uppercase tracking-wider font-semibold rounded-pill ${session.status === 'scheduled' ? 'bg-orange-500/20 text-orange-500' : session.status === 'canceled' ? 'bg-destructive/20 text-destructive' : 'bg-green-500/20 text-green-400'}`}>
                          {session.status}
                        </span>
                        {session.status === 'scheduled' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateSessionStatus(session._id, 'completed')} className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-pill hover:bg-green-500 hover:text-white transition-colors">Complete</button>
                            <button onClick={() => handleUpdateSessionStatus(session._id, 'canceled')} className="text-xs px-3 py-1 bg-destructive/20 text-destructive rounded-pill hover:bg-destructive hover:text-white transition-colors">Cancel</button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-surface-base p-4 rounded-lg border border-border-subtle mb-4">
                      <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Student Context</p>
                      <p className="text-sm">{session.submission_description}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Your Evaluation Notes</p>
                      <div className="flex gap-2">
                        <textarea 
                          rows={2} 
                          placeholder="Provide feedback..."
                          className="flex-1 bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-sm text-white"
                          value={notesDraft[session._id] !== undefined ? notesDraft[session._id] : (session.mentor_notes || '')}
                          onChange={e => setNotesDraft({ ...notesDraft, [session._id]: e.target.value })}
                        ></textarea>
                        <button onClick={() => handleUpdateNotes(session._id)} className="bg-surface-hover border border-border-subtle px-4 rounded-md text-sm hover:bg-white hover:text-black transition-colors">Save Notes</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && profile && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="glass-panel p-12 text-center text-muted-foreground">No completed or canceled sessions found.</div>
              ) : (
                history.map(session => (
                  <div key={session._id} className="glass-panel p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-white">Session with {session.student_id?.name || 'Student'}</h3>
                        <p className="text-muted-foreground font-mono text-sm">{new Date(session.scheduled_date).toLocaleDateString()} | {session.start_time} - {session.end_time}</p>
                      </div>
                      <div className="mt-2 md:mt-0 flex items-center gap-2">
                        <span className={`px-3 py-1 text-xs uppercase tracking-wider font-semibold rounded-pill ${session.status === 'scheduled' ? 'bg-orange-500/20 text-orange-500' : session.status === 'canceled' ? 'bg-destructive/20 text-destructive' : 'bg-green-500/20 text-green-400'}`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                    
                    {session.submission_description && (
                      <div className="bg-surface-base p-4 rounded-lg border border-border-subtle mb-4">
                        <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Student Context</p>
                        <p className="text-sm">{session.submission_description}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Your Evaluation Notes</p>
                      <div className="flex gap-2">
                        <textarea 
                          rows={2} 
                          placeholder="Provide feedback..."
                          className="flex-1 bg-surface-base border border-border-subtle rounded-md px-3 py-2 text-sm text-white"
                          value={notesDraft[session._id] !== undefined ? notesDraft[session._id] : (session.mentor_notes || '')}
                          onChange={e => setNotesDraft({ ...notesDraft, [session._id]: e.target.value })}
                        ></textarea>
                        <button onClick={() => handleUpdateNotes(session._id)} className="bg-surface-hover border border-border-subtle px-4 rounded-md text-sm hover:bg-white hover:text-black transition-colors">Save Notes</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default MentorDashboard;

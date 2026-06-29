import { useEffect, useState } from 'react';
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
  const [editingSlotId, setEditingSlotId] = useState(null);

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
      } catch {
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
    } catch {
      toast.error('Network error');
    }
  };

  // Availability Handlers
  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    try {
      const url = editingSlotId 
        ? `http://localhost:5005/api/mentor/availability/${editingSlotId}`
        : 'http://localhost:5005/api/mentor/availability';
      const method = editingSlotId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ day_of_week: newDay, start_time: newStart, end_time: newEnd })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingSlotId ? 'Slot updated' : 'Slot added');
        if (editingSlotId) {
          setAvailability(availability.map(a => a._id === editingSlotId ? data.availability : a));
          setEditingSlotId(null);
        } else {
          setAvailability([...availability, data.availability]);
        }
        setNewDay('Monday');
        setNewStart('');
        setNewEnd('');
      } else {
        toast.error(data.message || (editingSlotId ? 'Failed to update slot' : 'Failed to add slot'));
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleEditAvailability = (slot) => {
    setEditingSlotId(slot._id);
    setNewDay(slot.day_of_week);
    setNewStart(slot.start_time);
    setNewEnd(slot.end_time);
  };

  const cancelEdit = () => {
    setEditingSlotId(null);
    setNewDay('Monday');
    setNewStart('');
    setNewEnd('');
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
    } catch {
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
              // Deduplicate: remove any existing entry with the same id before prepending
              const withoutStale = prevHist.filter(s => s._id !== id);
              return [updatedSession, ...withoutStale].sort((a, b) => {
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
    } catch {
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
    } catch {
      toast.error('Network error');
    }
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 max-w-7xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter text-primary mb-2">Mentor Workspace</h1>
          <p className="text-muted-foreground text-base">Manage your profile, availability, and sessions</p>
        </div>
      </div>

      <div className="flex border-b border-border/60 mb-8 gap-1">
        {['profile', 'availability', 'sessions', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={!profile && tab !== 'profile'}
            className={`px-6 py-3 uppercase tracking-wider font-semibold text-sm transition-all rounded-full ${
              !profile && tab !== 'profile' ? 'opacity-50 cursor-not-allowed text-muted-foreground' :
              activeTab === tab ? 'text-primary bg-primary/10 border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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
            <div className="glass-panel p-6 md:p-8">
              {!profile && (
                <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold mb-1">Welcome to MentHub!</p>
                    <p className="text-sm">Please initialize your profile to start accepting sessions.</p>
                  </div>
                </div>
              )}
              <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>
              <div className="grid lg:grid-cols-2 gap-8">
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Full Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Title</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Technology Stack</label>
                    <select required value={selectedStack} onChange={e => setSelectedStack(e.target.value)} className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      <option value="" disabled className="bg-background text-muted-foreground">Select your primary stack...</option>
                      {stacks.map(s => <option key={s._id} value={s._id} className="bg-background text-foreground">{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Hourly Rate ($)</label>
                    <input type="number" required value={hourlyRate} onChange={e => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Bio</label>
                    <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" placeholder="Tell students about your experience and expertise..."></textarea>
                  </div>
                  <button type="submit" className="bg-primary text-primary-foreground font-semibold rounded-full px-8 py-3 hover:bg-primary/90 transition-colors mt-2">{profile ? 'Update Profile' : 'Initialize Profile'}</button>
                </form>
                <div className="bg-card/50 border border-border/60 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Profile Preview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">{name?.charAt(0) || '?'}</div>
                      <div>
                        <p className="font-semibold text-foreground">{name || 'Your Name'}</p>
                        <p className="text-sm text-muted-foreground">{title || 'Your Title'}</p>
                      </div>
                    </div>
                    <div className="border-t border-border/60 pt-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Hourly Rate</p>
                      <p className="text-2xl font-bold text-primary">${hourlyRate || 0}<span className="text-sm font-normal text-muted-foreground">/hr</span></p>
                    </div>
                    <div className="border-t border-border/60 pt-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Technology Stack</p>
                      <p className="text-foreground">{stacks.find(s => s._id === selectedStack)?.name || 'Not selected'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AVAILABILITY TAB */}
          {activeTab === 'availability' && profile && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-panel p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-6">{editingSlotId ? 'Edit Slot' : 'Add New Slot'}</h2>
                <form onSubmit={handleSaveAvailability} className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Day of Week</label>
                    <select value={newDay} onChange={e => setNewDay(e.target.value)} className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d} value={d} className="bg-background text-foreground">{d}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Start Time</label>
                      <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} required className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">End Time</label>
                      <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} required className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all [color-scheme:dark]" />
                    </div>
                  </div>
                  {/* Slot-count hint */}
                  {(() => {
                    if (!newStart || !newEnd) return null;
                    const [sH, sM] = newStart.split(':').map(Number);
                    const [eH, eM] = newEnd.split(':').map(Number);
                    const startMins = sH * 60 + sM;
                    const endMins   = eH * 60 + eM;
                    const diff = endMins - startMins;
                    if (diff <= 0) return null;

                    const fullSlots  = Math.floor(diff / 45);
                    const remainder  = diff % 45;
                    const isAligned  = remainder === 0;

                    // Nearest valid end times (down and up)
                    const snapDown = startMins + fullSlots * 45;
                    const snapUp   = startMins + (fullSlots + 1) * 45;
                    const toHHMM = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

                    if (fullSlots === 0) {
                      return (
                        <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-2.5 -mt-2">
                          ⚠ Window is less than 45 min — no bookable slots. Try ending at <strong>{toHHMM(snapUp)}</strong> for 1 slot.
                        </p>
                      );
                    }

                    if (isAligned) {
                      return (
                        <p className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-2.5 -mt-2">
                          ✓ Perfect — fits exactly <strong>{fullSlots} × 45-min slot{fullSlots > 1 ? 's' : ''}</strong>.
                        </p>
                      );
                    }

                    return (
                      <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-2.5 -mt-2">
                        ⚠ Fits <strong>{fullSlots} slot{fullSlots > 1 ? 's' : ''}</strong> + {remainder} leftover min. Snap to&nbsp;
                        <button type="button" onClick={() => setNewEnd(toHHMM(snapDown))} className="underline underline-offset-2 hover:text-amber-300 transition-colors font-semibold">
                          {toHHMM(snapDown)}
                        </button>
                        {' '}or&nbsp;
                        <button type="button" onClick={() => setNewEnd(toHHMM(snapUp))} className="underline underline-offset-2 hover:text-amber-300 transition-colors font-semibold">
                          {toHHMM(snapUp)}
                        </button>
                        .
                      </p>
                    );
                  })()}

                  <div className="flex gap-3">
                    <button type="submit" className="bg-primary text-primary-foreground font-semibold rounded-full px-8 py-3 hover:bg-primary/90 transition-colors flex-1">
                      {editingSlotId ? 'Update Time Slot' : 'Add Time Slot'}
                    </button>
                    {editingSlotId && (
                      <button type="button" onClick={cancelEdit} className="bg-muted text-muted-foreground font-semibold rounded-full px-8 py-3 hover:bg-muted/80 transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="glass-panel p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-6">Current Availability</h2>
                {availability.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-card/50 flex items-center justify-center">
                      <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground text-base">No slots configured yet.</p>
                    <p className="text-muted-foreground text-sm mt-1">Add your first availability slot above.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {availability.map(slot => (
                      <li key={slot._id} className="flex justify-between items-center p-4 bg-card/50 border border-border/60 rounded-2xl hover:bg-card/70 transition-colors">
                        <span className="font-semibold text-foreground">{slot.day_of_week}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-mono text-sm mr-2">{slot.start_time} - {slot.end_time}</span>
                          <button onClick={() => handleEditAvailability(slot)} className="text-foreground text-sm hover:text-primary transition-colors px-4 py-2 rounded-full hover:bg-primary/10 font-medium">Edit</button>
                          <button onClick={() => handleDeleteAvailability(slot._id)} className="text-destructive text-sm hover:text-destructive/80 transition-colors px-4 py-2 rounded-full hover:bg-destructive/10 font-medium">Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* SESSIONS TAB */}
          {activeTab === 'sessions' && profile && (
            <div className="space-y-6">
              {sessions.length === 0 ? (
                <div className="glass-panel p-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-card/50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-base">No incoming sessions.</p>
                  <p className="text-muted-foreground text-sm mt-1">Students will appear here when they book sessions with you.</p>
                </div>
              ) : (
                sessions.map(session => (
                  <div key={session._id} className="glass-panel p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-foreground mb-2">Session with {session.student_id?.name || 'Student'}</h3>
                        <p className="text-muted-foreground font-mono text-sm">{new Date(session.scheduled_date).toLocaleDateString()} | {session.start_time} - {session.end_time}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full ${session.status === 'scheduled' ? 'bg-primary/20 text-primary' : session.status === 'canceled' ? 'bg-destructive/20 text-destructive' : 'bg-green-500/20 text-green-400'}`}>
                          {session.status}
                        </span>
                        {session.status === 'scheduled' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateSessionStatus(session._id, 'completed')} className="text-xs px-4 py-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500 hover:text-white transition-colors font-medium">Complete</button>
                            <button onClick={() => handleUpdateSessionStatus(session._id, 'canceled')} className="text-xs px-4 py-2 bg-destructive/20 text-destructive rounded-full hover:bg-destructive hover:text-white transition-colors font-medium">Cancel</button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-card/50 p-5 rounded-2xl border border-border/60 mb-6">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Student Context</p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{session.submission_description}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Your Evaluation Notes</p>
                      <div className="flex flex-col gap-3">
                        <textarea 
                          rows={4} 
                          placeholder="Provide feedback..."
                          className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y min-h-[100px]"
                          value={notesDraft[session._id] !== undefined ? notesDraft[session._id] : (session.mentor_notes || '')}
                          onChange={e => setNotesDraft({ ...notesDraft, [session._id]: e.target.value })}
                        ></textarea>
                        <div className="flex justify-end">
                          <button onClick={() => handleUpdateNotes(session._id)} className="bg-primary text-primary-foreground font-semibold rounded-full px-8 py-3 hover:bg-primary/90 transition-colors">Save Notes</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && profile && (
            <div className="space-y-6">
              {history.length === 0 ? (
                <div className="glass-panel p-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-card/50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-base">No completed or canceled sessions found.</p>
                  <p className="text-muted-foreground text-sm mt-1">Your session history will appear here.</p>
                </div>
              ) : (
                history.map(session => (
                  <div key={session._id} className="glass-panel p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-foreground mb-2">Session with {session.student_id?.name || 'Student'}</h3>
                        <p className="text-muted-foreground font-mono text-sm">{new Date(session.scheduled_date).toLocaleDateString()} | {session.start_time} - {session.end_time}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full ${session.status === 'scheduled' ? 'bg-primary/20 text-primary' : session.status === 'canceled' ? 'bg-destructive/20 text-destructive' : 'bg-green-500/20 text-green-400'}`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                    
                    {session.submission_description && (
                      <div className="bg-card/50 p-5 rounded-2xl border border-border/60 mb-6">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Student Context</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{session.submission_description}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Your Evaluation Notes</p>
                      <div className="flex flex-col gap-3">
                        <textarea 
                          rows={4} 
                          placeholder="Provide feedback..."
                          className="w-full bg-card border border-border/60 rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y min-h-[100px]"
                          value={notesDraft[session._id] !== undefined ? notesDraft[session._id] : (session.mentor_notes || '')}
                          onChange={e => setNotesDraft({ ...notesDraft, [session._id]: e.target.value })}
                        ></textarea>
                        <div className="flex justify-end">
                          <button onClick={() => handleUpdateNotes(session._id)} className="bg-primary text-primary-foreground font-semibold rounded-full px-8 py-3 hover:bg-primary/90 transition-colors">Save Notes</button>
                        </div>
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

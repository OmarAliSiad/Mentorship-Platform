import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import UpcomingSession from "../components/ui/UpcomingSession";

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const token = user?.token;
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const nextSession = sessions
    .filter((s) => s.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.scheduled_date + "T" + a.start_time) -
        new Date(b.scheduled_date + "T" + b.start_time),
    )[0];

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5005/api/student/sessions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch {
        toast.error("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSessions();
  }, [token]);

  const handleCancel = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5005/api/student/sessions/${id}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setSessions(
          sessions.map((s) =>
            s._id === id ? { ...s, status: "canceled" } : s,
          ),
        );
        toast.success("Session canceled successfully");
      } else {
        toast.error("Failed to cancel session");
      }
    } catch {
      toast.error("Error canceling session");
    }
  };

  // Reschedule modal state
  const [rescheduleSession, setRescheduleSession] = useState(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [mentorAvailability, setMentorAvailability] = useState([]);
  const [resBookingDate, setResBookingDate] = useState('');
  const [resBookingTime, setResBookingTime] = useState('');

  const generateAvailableDates = (availList) => {
    if (!availList || availList.length === 0) return [];
    const daysMap = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
    const availableDays = availList.map(a => daysMap[a.day_of_week]);
    const dates = [];
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i=0;i<30;i++){
      const date = new Date(today); date.setDate(today.getDate()+i);
      if (availableDays.includes(date.getDay())){
        const year = date.getFullYear();
        const month = String(date.getMonth()+1).padStart(2,'0');
        const dayStr = String(date.getDate()).padStart(2,'0');
        const formattedDate = `${year}-${month}-${dayStr}`;
        const displayLabel = date.toLocaleDateString('en-US',{ weekday:'short', month:'short', day:'numeric' });
        dates.push({ value: formattedDate, label: displayLabel });
      }
    }
    return dates;
  };

  const getSlotsForDate = (dateStr, availList) => {
    if (!dateStr || !availList || availList.length === 0) return [];
    const [y,m,d] = dateStr.split('-').map(Number);
    const localDate = new Date(y,m-1,d);
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayName = days[localDate.getDay()];
    const dayAvails = availList.filter(a => a.day_of_week === dayName);
    const slots = [];
    const now = new Date();
    dayAvails.forEach(avail => {
      let [startH,startM] = avail.start_time.split(':').map(Number);
      let [endH,endM] = avail.end_time.split(':').map(Number);
      let currentStart = new Date(localDate); currentStart.setHours(startH,startM,0,0);
      let blockEnd = new Date(localDate); blockEnd.setHours(endH,endM,0,0);
      while(true){
        let slotEnd = new Date(currentStart); slotEnd.setMinutes(currentStart.getMinutes()+45);
        if (slotEnd <= blockEnd){
          if (currentStart > now) {
            const timeStr = currentStart.toTimeString().substring(0,5);
            slots.push(timeStr);
          }
          currentStart = new Date(slotEnd);
        } else break;
      }
    });
    return slots;
  };

  const openReschedule = async (session) => {
    setRescheduleSession(session);
    setRescheduleLoading(true);
    try {
      // fetch mentor availability
      // API expects mentor user_id in the URL (studentController.getMentorDetails uses user_id)
      const mentorUserId = session.mentor_id?.user_id || session.mentor_id;
      const res = await fetch(`http://localhost:5005/api/student/mentors/${mentorUserId}`);
      if (res.ok) {
        const data = await res.json();
        setMentorAvailability(data.availability || []);
        const dates = generateAvailableDates(data.availability || []);
        setResBookingDate(dates[0]?.value || '');
        setResBookingTime('');
      } else {
        toast.error('Failed to load mentor availability');
      }
    } catch {
      toast.error('Failed to load mentor availability');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const closeReschedule = () => {
    setRescheduleSession(null);
    setMentorAvailability([]);
    setResBookingDate('');
    setResBookingTime('');
    setRescheduleLoading(false);
  };

  const confirmReschedule = async () => {
    if (!resBookingDate || !resBookingTime || !rescheduleSession) return toast.error('Select date and time');
    setRescheduleLoading(true);
    try {
      // call reschedule endpoint to update existing session atomically
      const start_time = resBookingTime;
      const [hours, minutes] = start_time.split(':').map(Number);
      let dateObj = new Date(2000,0,1,hours,minutes);
      dateObj.setMinutes(dateObj.getMinutes()+45);
      const end_time = dateObj.toTimeString().substring(0,5);

      const res = await fetch(`http://localhost:5005/api/student/sessions/${rescheduleSession._id}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ scheduled_date: resBookingDate, start_time, end_time })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Session rescheduled');
        // refresh sessions from server to ensure mentor_id is populated and state is consistent
        try {
          const listRes = await fetch('http://localhost:5005/api/student/sessions', { headers: { Authorization: `Bearer ${token}` } });
          if (listRes.ok) {
            const listData = await listRes.json();
            setSessions(listData);
          }
        } catch (e) {
          // non-fatal: keep optimistic update if fetch fails
          setSessions(prev => prev.map(s => s._id === rescheduleSession._id ? { ...s, ...data.session } : s));
        }
        closeReschedule();
      } else {
        toast.error(data.message || 'Failed to reschedule');
      }
    } catch {
      toast.error('Network error while rescheduling');
    } finally {
      setRescheduleLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 max-w-5xl">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 uppercase tracking-tighter text-orange-500">
        My Tailored Workspace
      </h1>

      {loading ? (
        <div className="text-muted-foreground text-center py-12 animate-pulse">
          Loading workspace...
        </div>
      ) : sessions.length === 0 ? (
        <UpcomingSession session={null} />
      ) : (
        <div className="grid gap-6">
          <UpcomingSession session={nextSession} onCancel={handleCancel} onReschedule={openReschedule} />

          <div className="grid gap-6">
            {sessions
              .filter(s => !nextSession || s._id !== nextSession._id)
              .map((session) => (
              <div
                key={session._id}
                className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-xl">
                      {session.mentor_id?.name || "Unknown Mentor"}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-pill uppercase tracking-wider font-semibold ${
                        session.status === "scheduled"
                          ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30"
                          : session.status === "canceled"
                            ? "bg-destructive/20 text-destructive border border-destructive/30"
                            : "bg-green-500/20 text-green-400 border border-green-500/30"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>

                  <p className="text-muted-foreground font-mono text-sm mb-3">
                    {new Date(session.scheduled_date).toLocaleDateString()} |{" "}
                    {session.start_time} - {session.end_time}
                  </p>

                  {session.submission_description && (
                    <div className="bg-surface-base p-4 rounded-lg border border-border-subtle">
                      <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-1">
                        Context
                      </p>
                      <p className="text-sm text-primary leading-relaxed">
                        {session.submission_description}
                      </p>
                    </div>
                  )}
                  {session.mentor_notes && (
                    <div className="mt-4 bg-primary/10 p-4 rounded-lg border border-primary/20">
                      <p className="text-xs uppercase text-accent-primary font-semibold tracking-wider mb-1">
                        Evaluation Notes
                      </p>
                      <p className="text-sm text-primary leading-relaxed">
                        {session.mentor_notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3">
                  {session.status === "scheduled" && (
                    <button
                      onClick={() => handleCancel(session._id)}
                      className="w-full md:w-auto px-6 py-3 rounded-pill bg-destructive/10 text-destructive font-medium border border-destructive/30 hover:bg-destructive hover:text-white transition-colors"
                    >
                      Cancel Session
                    </button>
                  )}
                  {session.status === 'scheduled' && (
                    <button onClick={() => openReschedule(session)} className="w-full md:w-auto px-6 py-3 rounded-pill border border-border/40 text-foreground hover:bg-muted transition-colors">Reschedule</button>
                  )}
                  {session.can_review && session.mentor_id?.user_id && (
                    <button
                      onClick={() =>
                        navigate(
                          `/mentors/${session.mentor_id.user_id}?review=1`,
                        )
                      }
                      className="w-full md:w-auto px-6 py-3 rounded-pill bg-primary/10 text-primary font-medium border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Write Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeReschedule} />
          <div className="relative w-full max-w-2xl mx-4">
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Reschedule Session</h3>
                <button onClick={closeReschedule} className="text-muted-foreground">✕</button>
              </div>

              {rescheduleLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Select Date</label>
                    <select value={resBookingDate} onChange={(e) => { setResBookingDate(e.target.value); setResBookingTime(''); }} className="w-full bg-background border border-border-subtle rounded-md px-4 py-3 text-foreground">
                      <option value="" disabled>Choose a date</option>
                      {generateAvailableDates(mentorAvailability).map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Available Times</label>
                    <div className="grid grid-cols-3 gap-2">
                      {getSlotsForDate(resBookingDate, mentorAvailability).map(time => (
                        <button key={time} type="button" onClick={() => setResBookingTime(time)} className={`py-2 px-1 text-sm rounded-md ${resBookingTime === time ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground border border-border-subtle hover:bg-muted'}`}>
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button onClick={closeReschedule} className="px-4 py-2 rounded-md border border-border-subtle">Cancel</button>
                    <button onClick={confirmReschedule} disabled={rescheduleLoading || !resBookingDate || !resBookingTime} className="px-4 py-2 rounded-md bg-orange-500 text-white">Confirm Reschedule</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

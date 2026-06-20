import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from './Avatar';

const IconCalendar = ({ className = "size-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3M16 7V3M3 11h18M21 19H3V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12z"
    />
  </svg>
);

const IconClock = ({ className = "size-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 7v5l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const IconVideo = ({ className = "size-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 10l4-3v10l-4-3M4 6h9v12H4z"
    />
  </svg>
);

const statusStyles = {
  scheduled: "bg-green-600/10 text-green-300 border border-green-600/20",
  pending: "bg-yellow-600/10 text-yellow-300 border border-yellow-600/20",
  canceled: "bg-destructive/10 text-destructive border border-destructive/30",
  completed: "bg-muted/10 text-muted-foreground border border-border/30",
};

export default function UpcomingSession({ session, onCancel, onReschedule }) {
  const navigate = useNavigate();

  const now = Date.now();
  const startTs = session
    ? new Date(session.scheduled_date + "T" + session.start_time).getTime()
    : null;

  const countdown = useMemo(() => {
    if (!startTs) return null;
    const diff = startTs - now;
    if (diff <= 0) return "Starting now";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `Starts in ${days} day${days > 1 ? "s" : ""}`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `Starts in ${hours} hour${hours > 1 ? "s" : ""}`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `Starts in ${minutes} minute${minutes > 1 ? "s" : ""}`;
  }, [startTs, now]);

  if (!session) {
    return (
      <div className="glass-panel p-8 rounded-2xl bg-gradient-to-br from-card/40 to-card/30 backdrop-blur border border-border/40 shadow-md flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-surface-base/40 flex items-center justify-center text-3xl">
          🎯
        </div>
        <h3 className="text-2xl font-semibold">
          You don't have any upcoming sessions yet.
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Book your first mentorship session to get personalized guidance from
          experienced mentors.
        </p>
        <div className="mt-2 w-full sm:w-auto">
          <button
            onClick={() => navigate("/mentors")}
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-orange-600 transition"
          >
            Find a Mentor
          </button>
        </div>
      </div>
    );
  }

  const mentor = session.mentor_id || {};
  const meetingText = session.meeting_type || "Meeting";
  const duration =
    session.duration ||
    `${(new Date("1970-01-01T" + session.end_time) - new Date("1970-01-01T" + session.start_time)) / (1000 * 60)} mins`;

  return (
    <div className="glass-panel p-6 md:p-8 rounded-2xl bg-gradient-to-br from-card/40 to-card/30 backdrop-blur border border-border/40 shadow-lg transition-transform hover:translate-y-0.5 hover:shadow-2xl">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar src={mentor.avatar} name={mentor.name} className="w-16 h-16 rounded-full ring-1 ring-border/40" />
          <div>
            <h4 className="text-lg font-semibold">Upcoming Session</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-foreground">
                {mentor.name || "Mentor"}
              </span>
              <span className="text-sm text-muted-foreground">
                · {mentor.title || mentor.specialization || "Mentorship"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[session.status] || statusStyles.scheduled}`}
          >
            {session.status}
          </span>
          <span className="text-sm text-muted-foreground">{countdown}</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="flex items-center gap-3">
          <IconCalendar className="size-5 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Date</div>
            <div className="font-medium">
              {new Date(session.scheduled_date).toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(session.scheduled_date).toLocaleString(undefined, {
                weekday: "long",
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <IconClock className="size-5 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Time</div>
            <div className="font-medium">
              {session.start_time} — {session.end_time}
            </div>
            <div className="text-xs text-muted-foreground">
              Duration: {duration}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <IconVideo className="size-5 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Meeting</div>
            <div className="font-medium">{meetingText}</div>
            <div className="text-xs text-muted-foreground">
              {session.location || session.meeting_link
                ? "Link provided"
                : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Context / Notes */}
      {(session.submission_description || session.mentor_notes) && (
        <div className="mt-6 bg-surface-base p-4 rounded-lg border border-border-subtle">
          {session.submission_description && (
            <div className="mb-3">
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-1">Context</p>
              <p className="text-sm text-foreground leading-relaxed">{session.submission_description}</p>
            </div>
          )}
          {session.mentor_notes && (
            <div>
              <p className="text-xs uppercase text-accent-primary font-semibold tracking-wider mb-1">Evaluation Notes</p>
              <p className="text-sm text-primary leading-relaxed">{session.mentor_notes}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex gap-3 w-full sm:w-auto">
          {session.meeting_link && session.status === "scheduled" ? (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-full font-semibold shadow hover:bg-orange-600 transition"
            >
              Join Meeting
            </a>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 bg-muted/30 text-muted-foreground px-5 py-3 rounded-full font-semibold"
            >
              Join Meeting
            </button>
          )}

          {onCancel && session.status === 'scheduled' && (
            <>
              <button
                onClick={() => onCancel(session._id)}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-destructive/10 text-destructive font-medium border border-destructive/30 hover:bg-destructive hover:text-white transition-colors"
              >
                Cancel Session
              </button>

              {onReschedule && (
                <button
                  onClick={() => onReschedule(session)}
                  type="button"
                  className="inline-flex items-center gap-2 border border-border/40 text-foreground px-4 py-3 rounded-full hover:bg-muted transition"
                >
                  Reschedule
                </button>
              )}
            </>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Booked via{" "}
          <span className="text-foreground font-semibold">MentHub</span>
        </div>
      </div>
    </div>
  );
}

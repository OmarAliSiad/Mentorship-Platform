import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import Avatar from '../components/ui/Avatar';

// Avatar fallback handled by Avatar component

const generateAvailableDates = (availList) => {
  if (!availList || availList.length === 0) return [];
  const daysMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
  const availableDays = availList.map(a => daysMap[a.day_of_week]);

  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    if (availableDays.includes(date.getDay())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${dayStr}`;

      const displayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dates.push({ value: formattedDate, label: displayLabel });
    }
  }
  return dates;
};

const getSlotsForDate = (dateStr, availList) => {
  if (!dateStr || !availList || availList.length === 0) return [];
  const [y, m, d] = dateStr.split('-').map(Number);
  const localDate = new Date(y, m - 1, d);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[localDate.getDay()];

  const dayAvails = availList.filter(a => a.day_of_week === dayName);
  const slots = [];
  const now = new Date();

  dayAvails.forEach(avail => {
    let [startH, startM] = avail.start_time.split(':').map(Number);
    let [endH, endM] = avail.end_time.split(':').map(Number);

    let currentStart = new Date(localDate);
    currentStart.setHours(startH, startM, 0, 0);

    let blockEnd = new Date(localDate);
    blockEnd.setHours(endH, endM, 0, 0);

    while (true) {
      let slotEnd = new Date(currentStart);
      slotEnd.setMinutes(currentStart.getMinutes() + 45);

      if (slotEnd <= blockEnd) {
        if (currentStart > now) {
          const timeStr = currentStart.toTimeString().substring(0, 5);
          slots.push(timeStr);
        }
        currentStart = new Date(slotEnd);
      } else {
        break;
      }
    }
  });

  return slots;
};

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const token = user?.token;
  const openReviewFromUrl = searchParams.get('review') === '1';

  const [mentor, setMentor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [description, setDescription] = useState('');
  const [reviewFormOpen, setReviewFormOpen] = useState(openReviewFromUrl);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Derive available dates and slots from availability — avoids setState-in-effect antipattern
  const availableDates = useMemo(() => generateAvailableDates(availability), [availability]);
  const effectiveDate = bookingDate || availableDates[0]?.value || '';
  const availableSlots = useMemo(
    () => getSlotsForDate(effectiveDate, availability),
    [effectiveDate, availability]
  );

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await fetch(`http://localhost:5005/api/student/mentors/${id}`);
        if (res.ok) {
          const data = await res.json();
          setMentor(data.mentor);
          setAvailability(data.availability);
          setReviews(data.reviews || []);
        } else {
          toast.error('Mentor not found');
          navigate('/mentors');
        }
      } catch {
        toast.error('Failed to load mentor details');
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, [id, navigate]);

  useEffect(() => {
    const fetchReviewEligibility = async () => {
      if (!token || user?.role !== 'Student') {
        setReviewEligibility(null);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5005/api/student/mentors/${id}/review-eligibility`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          setReviewEligibility(null);
          return;
        }

        const data = await res.json();
        setReviewEligibility(data);

        if (data.eligible && openReviewFromUrl) {
          setReviewFormOpen(true);
        }
      } catch {
        setReviewEligibility(null);
      }
    };

    fetchReviewEligibility();
  }, [id, token, user?.role, openReviewFromUrl]);

  const handleSlotClick = (slot) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days.indexOf(slot.day_of_week);

    if (targetDay !== -1) {
      const today = new Date();
      const currentDay = today.getDay();

      let daysUntil = targetDay - currentDay;

      if (daysUntil < 0) {
        daysUntil += 7;
      } else if (daysUntil === 0) {
        const [hours, minutes] = slot.start_time.split(':').map(Number);
        if (today.getHours() > hours || (today.getHours() === hours && today.getMinutes() >= minutes)) {
          daysUntil += 7;
        }
      }

      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntil);

      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');

      setBookingDate(`${year}-${month}-${day}`);
      setBookingTime(''); // User needs to pick exact 45-min chunk
      toast.success(`Selected upcoming ${slot.day_of_week}`);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to book a session');
      return navigate('/login');
    }
    if (user.role !== 'Student') {
      return toast.error('Only students can book sessions.');
    }
    if (!bookingDate || !bookingTime) {
      return toast.error('Please select date and time');
    }

    const start_time = bookingTime; // HH:MM
    const [hours, minutes] = start_time.split(':').map(Number);
    let dateObj = new Date(2000, 0, 1, hours, minutes);
    dateObj.setMinutes(dateObj.getMinutes() + 45);
    const end_time = dateObj.toTimeString().substring(0, 5); // HH:MM

    try {
      const res = await fetch(`http://localhost:5005/api/student/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mentor_id: mentor._id,
          scheduled_date: bookingDate,
          start_time,
          end_time,
          submission_description: description
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Session booked successfully!');
        navigate('/student/dashboard');
      } else {
        toast.error(data.message || 'Failed to book session');
      }
    } catch {
      toast.error('Network error during booking');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewEligibility?.eligible) {
      return toast.error('Review is not available for this mentor yet.');
    }

    if (!Number.isInteger(reviewRating) || reviewRating < 1 || reviewRating > 5) {
      return toast.error('Choose a rating from 1 to 5.');
    }

    if (!reviewComment.trim()) {
      return toast.error('Please add a short review.');
    }

    setSubmittingReview(true);

    try {
      const res = await fetch(`http://localhost:5005/api/student/mentors/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment
        })
      });

      const data = await res.json();

      if (res.ok) {
        setReviews(prev => [data.review, ...prev]);
        setMentor(prev => ({
          ...prev,
          average_rating: data.mentor.average_rating,
          review_count: data.mentor.review_count
        }));
        setReviewEligibility({
          eligible: false,
          has_completed_session: true,
          has_existing_review: true,
          reason: 'You have already reviewed this mentor.',
          existing_review: data.review
        });
        setReviewComment('');
        setReviewRating(5);
        setReviewFormOpen(false);
        toast.success('Review submitted.');
      } else {
        toast.error(data.message || 'Failed to submit review');
      }
    } catch {
      toast.error('Network error while submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="text-center py-32 text-muted-foreground animate-pulse">Loading profile...</div>;
  if (!mentor) return null;

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Left Column: Profile & Availability */}
      <div className="lg:col-span-7 space-y-6">
        <div className="glass-panel p-6 md:p-8">
          {/* Header section with Avatar */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center border-b border-border-subtle pb-6 mb-6">
            <div className="shrink-0">
              <Avatar src={mentor.avatar} name={mentor.name} className="w-24 h-24 rounded-full border-2 border-primary/20" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">{mentor.name}</h1>
              <p className="text-lg text-primary font-medium mb-4">{mentor.title}</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 bg-background/50 border border-border-subtle px-3 py-1 rounded-full text-sm font-medium text-foreground">
                  <span className="text-primary">★</span> {mentor.average_rating.toFixed(1)}
                </span>
                <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm font-medium">
                  ${mentor.hourly_rate}/hr
                </span>
                {mentor.stack_id && (
                  <span className="bg-muted px-3 py-1 rounded-full text-sm text-muted-foreground border border-border">
                    {mentor.stack_id.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">About</h2>
            {mentor.bio ? (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{mentor.bio}</p>
            ) : (
              <div className="bg-muted/30 border border-dashed border-border rounded-lg p-6 text-center">
                <p className="text-muted-foreground italic">No professional bio has been provided yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="glass-panel p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Reviews</h2>
              <p className="text-sm text-muted-foreground">
                {mentor.review_count || 0} {(mentor.review_count || 0) === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            {reviewEligibility?.eligible && !reviewFormOpen && (
              <button
                type="button"
                onClick={() => setReviewFormOpen(true)}
                className="btn-primary px-5 py-2"
              >
                Write Review
              </button>
            )}
          </div>

          {reviewEligibility?.eligible && reviewFormOpen && (
            <form onSubmit={handleReviewSubmit} className="mb-6 bg-background/50 border border-border-subtle rounded-md p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Rating</label>
                <div className="grid grid-cols-5 gap-2 max-w-xs">
                  {[1, 2, 3, 4, 5].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReviewRating(value)}
                      className={`h-10 rounded-md border text-sm font-semibold transition-colors ${reviewRating === value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border-subtle hover:border-primary/50'
                        }`}
                      aria-pressed={reviewRating === value}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Review</label>
                <textarea
                  required
                  maxLength={1000}
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  placeholder="Share what stood out from your session"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setReviewFormOpen(false)}
                  className="px-5 py-2 rounded-md border border-border-subtle text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {user?.role === 'Student' && reviewEligibility && !reviewEligibility.eligible && reviewEligibility.reason && (
            <p className="mb-5 text-sm text-muted-foreground bg-muted/30 border border-border-subtle rounded-md px-4 py-3">
              {reviewEligibility.reason}
            </p>
          )}

          {reviews.length === 0 ? (
            <div className="bg-muted/30 border border-dashed border-border rounded-lg p-6 text-center">
              <p className="text-muted-foreground italic">No reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review._id} className="border border-border-subtle rounded-md p-4 bg-background/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <p className="font-semibold text-foreground">{review.student_id?.name || 'Student'}</p>
                    <span className="text-sm font-semibold text-primary">★ {Number(review.rating).toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Availability Section */}
        {availability.length > 0 && (
          <div className="glass-panel p-6 md:p-8">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Availability Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availability.map((slot, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSlotClick(slot)}
                  className="flex justify-between items-center p-3 bg-background/50 border border-border-subtle rounded-md hover:bg-muted hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors">{slot.day_of_week}</span>
                  <span className="text-muted-foreground text-sm font-mono bg-muted px-2 py-1 rounded">{slot.start_time} - {slot.end_time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Booking Form */}
      <div className="lg:col-span-5">
        <div className="glass-panel border-t-4 border-t-primary shadow-xl p-6 md:p-8 sticky top-24 bg-card/95 backdrop-blur-xl">
          <div className="mb-6 border-b border-border-subtle pb-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Reserve Slot</h2>
            <p className="text-sm text-muted-foreground mt-1">Book a 45-minute 1-on-1 session</p>
          </div>

          {availability.length === 0 ? (
            <div className="bg-muted/30 border border-dashed border-border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">This mentor has not published any available time slots.</p>
              <button disabled className="w-full btn-primary py-3 text-base tracking-wide mt-6 opacity-50 cursor-not-allowed">
                Booking Unavailable
              </button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Select Date</label>
                <div className="relative">
                  <select
                    required
                    value={effectiveDate}
                    onChange={(e) => { setBookingDate(e.target.value); setBookingTime(''); }}
                    className="w-full bg-background border border-border-subtle rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Choose a date</option>
                    {availableDates.map(date => (
                      <option key={date.value} value={date.value}>{date.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Available Slots</label>
                {availableSlots.length === 0 ? (
                  <div className="bg-background border border-border-subtle rounded-md px-4 py-3 text-sm text-muted-foreground text-center">
                    No remaining slots for this date
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setBookingTime(time)}
                        className={`py-2 px-1 text-sm rounded-md transition-colors border ${bookingTime === time
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-border-subtle hover:border-primary/50 hover:bg-muted'
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">Sessions are strictly isolated 45-minute code evaluations.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Submission Context</label>
                <textarea
                  required
                  rows={4}
                  placeholder="What do you want to review? (e.g. async race condition in Node)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={!bookingDate || !bookingTime}
                className="w-full btn-primary py-3 text-base tracking-wide mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Secure 45-min Session
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;

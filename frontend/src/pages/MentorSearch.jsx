import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Pagination } from '@/components/ui/pagination';

/** Number of mentor cards per page — must match the 3-column desktop grid (3 × 3 = 9) */
const PAGE_SIZE = 9;

const MentorSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  useAuthStore();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for search filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'rating');
  const [stack] = useState(searchParams.get('stack') || '');

  // Pagination
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Mentors
  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({
        page,
        limit: PAGE_SIZE,
        sort_by: sortBy,
      });
      if (debouncedSearch) query.append('search', debouncedSearch);
      if (stack) query.append('stack', stack);

      // Update URL silently
      setSearchParams(query, { replace: true });

      const response = await fetch(`http://localhost:5005/api/student/mentors?${query.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch mentors');

      const data = await response.json();
      setMentors(data.mentors);
      setTotalPages(data.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, stack, sortBy, page, setSearchParams]);

  useEffect(() => {
    fetchMentors(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchMentors]);

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 text-primary max-w-7xl">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 uppercase tracking-tighter drop-shadow-lg text-foreground">Discovery Engine</h1>
        <p className="text-muted-foreground text-lg">Browse technical mentors and reserve your session.</p>
      </div>

      <div className="glass-panel p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search by name or title..."
          className="flex-1 bg-surface-base border border-border-subtle rounded-md px-4 py-2 text-primary focus:outline-none focus:border-accent-primary transition-colors"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="bg-surface-base border border-border-subtle rounded-md px-4 py-2 text-primary focus:outline-none focus:border-accent-primary transition-colors"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
        >
          <option value="rating">Top Rated</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-secondary py-12 animate-pulse">Loading optimized index...</div>
      ) : error ? (
        <div className="text-center text-destructive py-12 bg-destructive/10 rounded-lg">{error}</div>
      ) : mentors.length === 0 ? (
        <div className="text-center text-secondary py-12 border border-border-subtle rounded-lg border-dashed">
          No mentors found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map(mentor => (
            <div key={mentor._id} className="glass-panel p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
              <div>
                <h3 className="text-2xl font-semibold mb-1 tracking-tight text-foreground">{mentor.name}</h3>
                <p className="text-primary text-sm mb-4 uppercase tracking-wider font-medium">{mentor.title}</p>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">{mentor.bio || "No bio provided."}</p>
              </div>
              <div className="flex justify-between items-center border-t border-border-subtle pt-4 mt-auto">
                <div className="flex flex-col">
                  <span className="text-foreground font-bold tracking-wider"><span className="text-primary">★</span> {mentor.average_rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-xs">${mentor.hourly_rate}/hr</span>
                </div>
                <button
                  onClick={() => navigate(`/mentors/${mentor.user_id}`)}
                  className="btn-primary"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-8"
      />
    </div>
  );
};

export default MentorSearch;
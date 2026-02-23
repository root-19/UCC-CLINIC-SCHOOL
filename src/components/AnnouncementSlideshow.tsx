import { useEffect, useState } from 'react';
import { env } from '../config/env';
import bgClinic from '../assets/images/bg-clinic.png';

interface Announcement {
  id: string;
  title: string;
  description: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const AnnouncementSlideshow = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === announcements.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [announcements.length, isPaused]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${env.API_URL}/api/announcement`);
      const data = await response.json();

      if (data.success) {
        // Get only the latest announcements for slideshow
        const sortedAnnouncements = data.data
          .sort((a: Announcement, b: Announcement) => {
            const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
            const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5); // Show top 5 announcements
        setAnnouncements(sortedAnnouncements);
      } else {
        setError(data.message || 'Failed to fetch announcements');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? announcements.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === announcements.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <section className="relative w-full py-12 md:py-16 lg:py-20 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${bgClinic})` }}
      />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-clinic-green mb-4">
            Latest Announcements
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Stay updated with the latest news and important information from the clinic.
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-green"></div>
            <p className="mt-4 text-gray-600">Loading announcements...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {!loading && !error && announcements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No announcements available at the moment.</p>
            <p className="text-gray-500 text-sm mt-2">Please check back later for updates.</p>
          </div>
        )}

        {!loading && !error && announcements.length > 0 && (
          <div className="max-w-4xl mx-auto">
            {/* Slideshow Container */}
            <div 
              className="relative bg-white rounded-lg shadow-lg overflow-hidden"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Current Slide */}
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="px-3 py-1 bg-clinic-green text-white text-xs font-semibold rounded-full">
                        Announcement
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(announcements[currentIndex].createdAt)}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                      {announcements[currentIndex].title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {announcements[currentIndex].description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="absolute top-1/2 left-4 right-4 transform -translate-y-1/2 flex justify-between pointer-events-none">
                <button
                  onClick={goToPrevious}
                  className="bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg pointer-events-auto transition-all duration-200 hover:scale-110"
                  aria-label="Previous announcement"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  className="bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg pointer-events-auto transition-all duration-200 hover:scale-110"
                  aria-label="Next announcement"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {announcements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentIndex 
                        ? 'bg-clinic-green w-8' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Pause/Play Indicator */}
              <div className="absolute top-4 right-4">
                <div className={`flex items-center gap-1 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded-full ${
                  isPaused ? 'text-red-600' : 'text-green-600'
                }`}>
                  {isPaused ? (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Paused
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Auto-playing
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Slide Counter */}
            <div className="text-center mt-4 text-sm text-gray-600">
              {currentIndex + 1} of {announcements.length} announcements
            </div>
          </div>
        )}

        {/* Additional Info */}
        {!loading && !error && announcements.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Hover over announcements to pause • Use arrows to navigate • Click dots to jump to specific announcement
            </p>
            <p className="text-xs text-gray-500 mt-2">
              For more information or inquiries, please visit our clinic or contact us.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AnnouncementSlideshow;

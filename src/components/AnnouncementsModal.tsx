import { useEffect, useState } from 'react';
import Modal from './Modal';
import { env } from '../config/env';

interface AnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  image?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const AnnouncementsModal = ({ isOpen, onClose }: AnnouncementsModalProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAnnouncements();
    }
  }, [isOpen]);

  useEffect(() => {
    if (announcements.length > 0 && announcements[currentIndex].image) {
      console.log('Current announcement image URL:', `${env.API_URL}${announcements[currentIndex].image}`);
    }
  }, [announcements, currentIndex]);

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
        // Sort by date (newest first)
        const sortedAnnouncements = data.data.sort((a: Announcement, b: Announcement) => {
          const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
          const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
          return dateB.getTime() - dateA.getTime();
        });
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
    // Convert to Philippine time (UTC+8)
    const phTime = new Date(dateObj.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
    return phTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila'
    });
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? announcements.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === announcements.length - 1 ? 0 : currentIndex + 1);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Latest Announcements" size="lg">
      <div className="relative">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">⚠️</div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchAnnouncements}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">📢</div>
            <p className="text-gray-600">No announcements available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Slideshow Controls */}
            {announcements.length > 1 && (
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={goToPrevious}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  title="Previous announcement"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={togglePause}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                  >
                    {isPaused ? '▶️ Play' : '⏸️ Pause'}
                  </button>
                  <span className="text-sm text-gray-600">
                    {isPaused ? 'Paused' : 'Auto-playing'} • {currentIndex + 1} of {announcements.length}
                  </span>
                </div>
                
                <button
                  onClick={goToNext}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  title="Next announcement"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Current Announcement */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {announcements[currentIndex].title}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(announcements[currentIndex].createdAt)}
                </p>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {announcements[currentIndex].description}
                </p>
              </div>
              
              {announcements[currentIndex].image && (
                <div className="mt-4">
                  <img
                    src={`${env.API_URL}${announcements[currentIndex].image}`}
                    alt={announcements[currentIndex].title}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      console.error('Failed to load image:', `${env.API_URL}${announcements[currentIndex].image}`);
                    }}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'block';
                      console.log('Image loaded successfully:', `${env.API_URL}${announcements[currentIndex].image}`);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Dots Indicator */}
            {announcements.length > 1 && (
              <div className="flex justify-center space-x-2">
                {announcements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    title={`Go to announcement ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AnnouncementsModal;


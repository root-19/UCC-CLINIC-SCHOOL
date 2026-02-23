import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { DEV_CONFIG } from '../../config/dev-config';

interface NavItem {
  label: string;
  path: string;
  icon: ReactElement;
  badge?: number;
}

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const AdminSidebar = ({ isOpen = true, onClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending requests count for notification badge
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://clinic-backend-production-8835.up.railway.app'}/api/requests`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          const pending = data.data.filter((req: any) => req.status === 'pending');
          setPendingCount(pending.length);
        }
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const allNavItems: NavItem[] = [
    { 
      label: 'Dashboard', 
      path: '/admin/home',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    },
        { 
      label: 'Enhanced Inventory', 
      path: '/admin/enhanced-inventory',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
    },
    { 
      label: 'Student Record', 
      path: '/admin/registration',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    },
    { 
      label: 'Notifications', 
      path: '/admin/notifications',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
      badge: pendingCount
    },
    { 
      label: 'User Management', 
      path: '/admin/user-management',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    },
    { 
      label: 'Announcements', 
      path: '/admin/announcement',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
    },
    { 
      label: 'Requested Form', 
      path: '/admin/requested-form',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
    { 
      label: 'Monthly Report', 
      path: '/admin/monthly-report',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
    { 
      label: 'Reporting Dashboard', 
      path: '/admin/reporting',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    },
    { 
      label: 'Comprehensive Reports', 
      path: '/admin/comprehensive-reports',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m3-10V4a3 3 0 00-3-3h0a3 3 0 00-3 3v3m0 10V9a3 3 0 00-3-3h0a3 3 0 00-3 3v6" /></svg>
    },
  ];

  // Filter nav items based on feature availability
  const navItems = allNavItems.filter(item => {
    if (item.path === '/admin/user-management') {
      return DEV_CONFIG.FEATURES.USER_MANAGEMENT;
    }
    return true;
  });

  const handleNavClick = (path: string) => {
    setActiveItem(path);
    navigate(path);
    // Close sidebar on mobile after navigation
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static
          top-0 left-0
          w-72 h-full
          bg-gradient-to-b from-white to-gray-50
          border-r border-gray-200
          z-50
          transform transition-transform duration-300 ease-in-out
          shadow-xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}
      >
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-clinic-green to-clinic-green-hover shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-clinic-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">UCC Clinic</h2>
              <p className="text-xs text-white/80">Admin Panel</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-300 hover:rotate-90"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="mt-2 p-3">
          <div className="space-y-1">
            {navItems.map((item, index) => (
              <div key={item.path} className="animate-slide-in-right" style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}>
                <button
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-300 relative group rounded-lg ${
                    activeItem === item.path
                      ? 'bg-gradient-to-r from-clinic-green to-clinic-green-hover text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-white hover:text-clinic-green hover:shadow-md hover:scale-102'
                  }`}
                >
                  <span className={`transition-all duration-300 ${
                    activeItem === item.path ? 'text-white' : 'text-gray-500 group-hover:text-clinic-green'
                  }`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10 flex-1 text-left">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className={`absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${
                      activeItem === item.path ? 'bg-white text-red-500' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                  {activeItem === item.path && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </nav>
        
        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="text-center">
            <p className="text-xs text-gray-500">© 2024 UCC Clinic</p>
            <p className="text-xs text-gray-400 mt-1">Admin Dashboard v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoClinic from '../../assets/images/logo-clinic.png';

interface AdminTopBarProps {
  onMenuClick?: () => void;
}

const AdminTopBar = ({ onMenuClick }: AdminTopBarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-professional border-b border-gray-200 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 animate-fade-in">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:text-clinic-green hover:bg-gray-100 rounded-lg transition-all duration-300 hover:rotate-90"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/admin/home" className="flex items-center gap-2 sm:gap-3 group transition-transform duration-300 hover:scale-105">
          <img src={logoClinic} alt="UCC CLINIC Logo" className="h-6 sm:h-8 w-auto object-contain transition-transform duration-300 group-hover:rotate-3" />
          <span className="text-base sm:text-xl font-bold text-clinic-green hidden xs:inline transition-colors duration-300 group-hover:text-clinic-green-hover">UCC CLINIC</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Profile Section */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-3 sm:pl-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-clinic-green to-clinic-green-hover rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.username || 'Admin'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md"
            aria-label="Logout"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;

import { useEffect, useState } from 'react';
import { Scissors } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearToken, getRole } from '../lib/apiClient';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(getRole());
  const isAuthed = Boolean(role);
  const isUser = role === 'user';
  const isBarber = role === 'barber';

  useEffect(() => {
    setRole(getRole());
  }, [location.pathname]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = () => {
    clearToken();
    setRole(null);
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm z-50 shadow-lg">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <Scissors className="w-8 h-8 text-amber-500" />
            <span className="text-2xl font-bold text-white">Elite Cuts</span>
          </Link>
          <div className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection('home')}
              className="text-gray-300 hover:text-amber-500 transition-colors font-medium"
            >
              Ballina
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="text-gray-300 hover:text-amber-500 transition-colors font-medium"
            >
              Sherbimet
            </button>
            {isUser && (
              <button
                onClick={() => scrollToSection('booking')}
                className="text-gray-300 hover:text-amber-500 transition-colors font-medium"
              >
                Rezervo Tani
              </button>
            )}
            {isUser && (
              <button
                onClick={() => scrollToSection('my-appointments')}
                className="text-gray-300 hover:text-amber-500 transition-colors font-medium"
              >
                Rezervimet tuaja
              </button>
            )}
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-300 hover:text-amber-500 transition-colors font-medium"
            >
              Rreth Nesh
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-300 hover:text-amber-500 transition-colors font-medium"
            >
              Kontakt
            </button>
          </div>
          <div className="flex items-center space-x-3">
            {!isAuthed ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-amber-500 transition-colors font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-amber-500 text-slate-900 px-5 py-2 rounded-lg font-semibold hover:bg-amber-400 transition-all transform hover:scale-105"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                {isUser && (
                  <button
                    onClick={() => scrollToSection('booking')}
                    className="bg-amber-500 text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-amber-400 transition-all transform hover:scale-105"
                  >
                    Rezervoni Termin
                  </button>
                )}
                {isBarber && (
                  <Link
                    to="/barber"
                    className="bg-amber-500 text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-amber-400 transition-all transform hover:scale-105"
                  >
                    Rezervimet
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="border border-amber-500 text-amber-500 px-4 py-2 rounded-lg font-semibold hover:bg-amber-500 hover:text-slate-900 transition-all"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

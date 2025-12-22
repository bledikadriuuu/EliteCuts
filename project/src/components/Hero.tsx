import { useEffect, useState } from 'react';
import { Scissors, Award, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getRole } from '../lib/apiClient';

export default function Hero() {
  const location = useLocation();
  const [role, setRole] = useState(getRole());
  const isUser = role === 'user';

  useEffect(() => {
    setRole(getRole());
  }, [location.pathname]);

  const scrollToBooking = () => {
    const element = document.getElementById('booking');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Shërbim Premium, 
            <span className="text-amber-500"> Stili i Duhur</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">Përjetoni artin e prerjes klasike me teknika moderne. Barberët tanë ekspertë ofrojnë shërbime të jashtëzakonshme të kujdesit personal në një ambient profesional dhe të rafinuar.          </p>
          {isUser && (
            <button
              onClick={scrollToBooking}
              className="bg-amber-500 text-slate-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-amber-400 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Rezervoni Termin
            </button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex items-start space-x-4">
              <div className="bg-amber-500/20 p-3 rounded-lg">
                <Award className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Barberë Ekspertë</h3>
                <p className="text-gray-400">15+ vite përvojë</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-amber-500/20 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Orar i Fleksueshëm</h3>
                <p className="text-gray-400">Hapur 7 ditë në javë</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-amber-500/20 p-3 rounded-lg">
                <Scissors className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Shërbim Premium</h3>
                <p className="text-gray-400">Cilësi e garantuar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Scissors } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getRole } from '../lib/apiClient';

export default function Footer() {
  const location = useLocation();
  const [role, setRole] = useState(getRole());
  const isUser = role === 'user';

  useEffect(() => {
    setRole(getRole());
  }, [location.pathname]);

  return (
    <footer id="contact" className="bg-slate-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Scissors className="w-8 h-8 text-amber-500" />
              <span className="text-2xl font-bold">Elite Cuts</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Destinacioni juaj për shërbime premium të kujdesit personal, ku tradita bashkohet me stilin modern.
            </p>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-xl font-bold mb-6">Na Kontaktoni</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                <p className="text-gray-400">
                  Rruga Kryesore 123<br />
                  Qendra e Qytetit<br />
                  Prishtine, 10000
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <a
                  href="tel:+15551234567"
                  className="text-gray-400 hover:text-amber-500 transition-colors"
                >
                  (555) 123-4567
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <a
                  href="mailto:info@elitecuts.com"
                  className="text-gray-400 hover:text-amber-500 transition-colors"
                >
                  info@elitecuts.com
                </a>
              </div>
            </div>
          </div>

          {/* Orari */}
          <div>
            <h3 className="text-xl font-bold mb-6">Orari i Punës</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                <div className="text-gray-400">
                  <p className="font-semibold text-white mb-2">E Hënë - E Premte</p>
                  <p>09:00 - 20:00</p>
                </div>
              </div>
              <div className="text-gray-400 ml-8">
                <p className="font-semibold text-white mb-2">E Shtunë</p>
                <p>09:00 - 20:00</p>
              </div>
              <div className="text-gray-400 ml-8">
                <p className="font-semibold text-white mb-2">E Diel</p>
                <p>09:00 - 20:00</p>
              </div>
            </div>
          </div>

          {/* Lidhje të Shpejta */}
          <div>
            <h3 className="text-xl font-bold mb-6">Lidhje të Shpejta</h3>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="text-gray-400 hover:text-amber-500 transition-colors">
                  Ballina
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-400 hover:text-amber-500 transition-colors">
                  Shërbimet
                </a>
              </li>
              {isUser && (
                <li>
                  <a
                    href="#booking"
                    className="text-gray-400 hover:text-amber-500 transition-colors"
                  >
                    Rezervo Termin
                  </a>
                </li>
              )}
              <li>
                <a href="#about" className="text-gray-400 hover:text-amber-500 transition-colors">
                  Rreth Nesh
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-center md:text-left">
              &copy; {new Date().getFullYear()} Elite Cuts. Të gjitha të drejtat e rezervuara.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                Politika e Privatësisë
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                Kushtet e Shërbimit
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

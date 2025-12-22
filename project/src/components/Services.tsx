import { useEffect, useState } from 'react';
import { Clock, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Service } from '../types';
import { getRole } from '../lib/apiClient';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Gabim gjatë marrjes së shërbimeve:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBooking = () => {
    const role = getRole();
    if (role !== 'user') {
      setAuthNotice('Ju lutemi kyquni ose krijoni llogari për të rezervuar terminin.');
      const element = document.getElementById('services');
      element?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setAuthNotice('');
    const element = document.getElementById('booking');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section id="services" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Shërbimet Tona
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nga prerjet klasike deri te stilimet moderne, ofrojmë një gamë të plotë
            shërbimesh profesionale, të përshtatura sipas nevojave dhe preferencave
            të secilit klient.
          </p>
          {authNotice && (
            <div className="mt-6 inline-flex items-center rounded-xl bg-amber-100 px-4 py-3 text-amber-800 font-semibold">
              {authNotice}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group flex flex-col"
            >
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 group-hover:from-amber-500 group-hover:to-amber-600 transition-all duration-300">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {service.name}
                </h3>
                <div className="flex items-center justify-between text-white/90">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      Kohëzgjatja: {service.duration_minutes} min
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-2xl font-bold">
                      {service.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <p className="text-gray-600 mb-6 leading-relaxed flex-1">
                  {service.description}
                </p>
                <button
                  onClick={scrollToBooking}
                  className="w-full mt-auto bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 transition-colors group-hover:bg-amber-500"
                >
                  Rezervo Terminin
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

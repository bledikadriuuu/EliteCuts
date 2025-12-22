import { useState, useEffect, FormEvent } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { apiFetch } from '../lib/apiClient';
import { Service, Appointment } from '../types';
import type { UserProfile } from '../types/auth';

export default function BookingForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState('');
  const [formData, setFormData] = useState<Omit<Appointment, 'id' | 'created_at'>>({
    service_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hourRaw, minuteRaw] = time.split(':');
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return time;
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      setProfileError('');
      try {
        const data = (await apiFetch('/api/me')) as UserProfile;
        setProfile(data);
        setFormData((prev) => ({
          ...prev,
          client_name: data.name,
          client_email: data.email,
          client_phone: data.phone,
        }));
      } catch {
        setProfileError('Please login again to book an appointment.');
      }
    };

    loadProfile();
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('price', { ascending: true });
    setServices(data || []);
  };

  useEffect(() => {
    const loadAvailability = async () => {
      if (!formData.appointment_date) {
        setAvailableTimes([]);
        return;
      }

      try {
        const data = (await apiFetch(
          `/api/availability?date=${formData.appointment_date}`
        )) as { availableTimes: string[] };
        const times = data.availableTimes || [];
        setAvailableTimes(times);
        if (formData.appointment_time && !times.includes(formData.appointment_time)) {
          setFormData((prev) => ({ ...prev, appointment_time: '' }));
        }
      } catch {
        setAvailableTimes([]);
      }
    };

    loadAvailability();
  }, [formData.appointment_date, formData.appointment_time]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('appointments').insert([
        {
          ...formData,
          status: 'pending',
        },
      ]);

      if (error) throw error; 

      setSubmitted(true);
      setFormData({
        service_id: '',
        client_name: profile?.name || '',
        client_email: profile?.email || '',
        client_phone: profile?.phone || '',
        appointment_date: '',
        appointment_time: '',
        notes: '',
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Gabim gjatë krijimit të rezervimit:', error);
      alert('Ndodhi një gabim gjatë rezervimit të terminit. Ju lutemi provoni përsëri.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section id="booking" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Rezervoni Terminin Tuaj
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Rezervoni termin me një nga barberët tanë profesionistë. Do t'ju kontaktojmë brenda 24 orëve për konfirmim.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {submitted && (
            <div className="mb-8 bg-green-500 text-white p-6 rounded-xl flex items-center space-x-3 animate-pulse">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">
                Kërkesa për rezervim u dërgua me sukses! Do t'ju kontaktojmë së shpejti për konfirmim.
              </span>
            </div>
          )}
          {profileError && (
            <div className="mb-8 bg-red-100 text-red-700 p-4 rounded-xl">
              {profileError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Zgjidhni Shërbimin *
                </label>
                <div className="relative">
                  <select
                    name="service_id"
                    value={formData.service_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none transition-colors appearance-none bg-white"
                  >
                    <option value="">Zgjidhni një shërbim...</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.price.toFixed(2)} EUR ({service.duration_minutes} min)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Emri dhe Mbiemri *
                </label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  required
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Emri Mbiemri"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Numri i Telefonit *
                </label>
                <input
                  type="tel"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleChange}
                  required
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="+383 XX XXX XXX"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Adresa e Email-it *
                </label>
                <input
                  type="email"
                  name="client_email"
                  value={formData.client_email}
                  onChange={handleChange}
                  required
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Data e Preferuar *
                </label>
                <input
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  min={today}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Ora e Preferuar *
                </label>
                <select
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
                >
                  <option value="">Zgjidhni orën...</option>
                  {availableTimes.length === 0 && formData.appointment_date ? (
                    <option value="" disabled>
                      Nuk ka termine të lira
                    </option>
                  ) : (
                    availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Shënime Shtesë (Opsionale)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none transition-colors resize-none"
                  placeholder="Kërkesa apo preferenca të veçanta..."
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-amber-500 text-slate-900 py-4 rounded-lg font-bold text-lg hover:bg-amber-400 transition-all transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Duke u dërguar...' : 'Konfirmo Rezervimin'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

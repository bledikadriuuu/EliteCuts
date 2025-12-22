import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Services from '../components/Services';
import BookingForm from '../components/BookingForm';
import About from '../components/About';
import Footer from '../components/Footer';
import { apiFetch, getRole } from '../lib/apiClient';
import type { AppointmentItem, UserProfile } from '../types/auth';

export default function Home() {
  const location = useLocation();
  const [role, setRole] = useState(getRole());
  const isUser = role === 'user';
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [services, setServices] = useState<
    { id: string; name: string; price: number; duration_minutes: number }[]
  >([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState('');
  const [reschedule, setReschedule] = useState<{ id: string; date: string; time: string } | null>(
    null
  );
  const [rescheduleTimes, setRescheduleTimes] = useState<string[]>([]);
  const [rescheduleServiceId, setRescheduleServiceId] = useState('');

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
    setRole(getRole());
  }, [location.pathname]);

  useEffect(() => {
    const load = async () => {
      if (!isUser) {
        setAppointments([]);
        setProfile(null);
        return;
      }

      setLoadingAppointments(true);
      setError('');

      try {
        const [profileData, appointmentData, serviceData] = await Promise.all([
          apiFetch('/api/me'),
          apiFetch('/api/appointments?sort=asc'),
          apiFetch('/rest/v1/services?select=*&order=price.asc'),
        ]);

        setProfile(profileData as UserProfile);
        setAppointments((appointmentData as { data: AppointmentItem[] }).data);
        setServices(serviceData as { id: string; name: string; price: number; duration_minutes: number }[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load appointments');
      } finally {
        setLoadingAppointments(false);
      }
    };

    load();
  }, [isUser]);

  useEffect(() => {
    const loadRescheduleTimes = async () => {
      if (!reschedule?.date) {
        setRescheduleTimes([]);
        return;
      }

      try {
        const data = (await apiFetch(
          `/api/availability?date=${reschedule.date}&excludeId=${reschedule.id}`
        )) as { availableTimes: string[] };
        setRescheduleTimes(data.availableTimes || []);
      } catch (err) {
        setRescheduleTimes([]);
      }
    };

    loadRescheduleTimes();
  }, [reschedule?.date, reschedule?.id]);

  const refreshAppointments = async () => {
    const appointmentData = (await apiFetch('/api/appointments?sort=asc')) as {
      data: AppointmentItem[];
    };
    setAppointments(appointmentData.data);
  };

  const handleCancel = async (id: string) => {
    setError('');
    try {
      await apiFetch(`/api/appointments/${id}/cancel`, { method: 'PATCH' });
      await refreshAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed');
    }
  };

  const handleReschedule = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reschedule) return;

    setError('');
    try {
      await apiFetch(`/api/appointments/${reschedule.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          date: reschedule.date,
          time: reschedule.time,
          serviceId: rescheduleServiceId || undefined,
        }),
      });
      setReschedule(null);
      setRescheduleServiceId('');
      await refreshAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reschedule failed');
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      {isUser && <BookingForm />}
      {isUser && (
        <section id="my-appointments" className="py-20 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  Rezervimet tuaja
                </h2>
                <p className="text-xl text-gray-600">
                  Menaxhoni rezervimet tuaja dhe ndryshoni terminet kur nevojitet.
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {loadingAppointments ? (
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-600">
                  Nuk keni ende rezervime, {profile?.name || 'klient'}.
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {appointment.service}
                          </h3>
                          <p className="text-gray-600">
                            {appointment.date} at {formatTime(appointment.time)}
                          </p>
                          <p className="text-gray-600">
                            Cmimi: {Number(appointment.price || 0).toFixed(2)}
                          </p>
                          <p className="text-amber-600 font-semibold">{appointment.status}</p>
                          {appointment.notes && (
                            <p className="text-gray-500">Shenime: {appointment.notes}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleCancel(appointment._id)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setReschedule({
                                id: appointment._id,
                                date: appointment.date,
                                time: appointment.time,
                              });
                              setRescheduleServiceId('');
                            }}
                            className="border border-slate-900 px-4 py-2 rounded-lg font-semibold text-slate-900 hover:bg-slate-100"
                          >
                            Reschedule
                          </button>
                        </div>
                      </div>

                      {reschedule?.id === appointment._id && (
                        <form onSubmit={handleReschedule} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={reschedule.date}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(event) =>
                              setReschedule((prev) =>
                                prev ? { ...prev, date: event.target.value } : prev
                              )
                            }
                            required
                            className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                          />
                          <select
                            value={reschedule.time}
                            onChange={(event) =>
                              setReschedule((prev) =>
                                prev ? { ...prev, time: event.target.value } : prev
                              )
                            }
                            required
                            className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                          >
                            <option value="">Select time</option>
                            {rescheduleTimes.length === 0 && reschedule.date ? (
                              <option value="" disabled>
                                No slots available
                              </option>
                            ) : (
                              rescheduleTimes.map((time) => (
                                <option key={time} value={time}>
                                  {formatTime(time)}
                                </option>
                              ))
                            )}
                          </select>
                          <select
                            value={rescheduleServiceId}
                            onChange={(event) => setRescheduleServiceId(event.target.value)}
                            className="md:col-span-2 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                          >
                            <option value="">Keep current service</option>
                            {services.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name} - {service.price.toFixed(2)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="md:col-span-2 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg font-semibold hover:bg-amber-400"
                          >
                            Save
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      <About />
      <Footer />
    </div>
  );
}

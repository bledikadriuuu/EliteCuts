import { useEffect, useState } from 'react';
import { apiFetch, clearToken } from '../lib/apiClient';
import type { AppointmentItem, UserProfile } from '../types/auth';
import { Link, useNavigate } from 'react-router-dom';

export default function BarberDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reschedule, setReschedule] = useState<{ id: string; date: string; time: string } | null>(
    null
  );
  const [rescheduleTimes, setRescheduleTimes] = useState<string[]>([]);

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

  const filterBusinessHours = (times: string[]) =>
    times.filter((time) => {
      const [hour, minute] = time.split(':').map(Number);
      if (Number.isNaN(hour) || Number.isNaN(minute)) return false;
      if (hour < 9 || hour > 20) return false;
      if (hour === 20 && minute > 0) return false;
      return true;
    });

  const loadAppointments = async () => {
    const data = (await apiFetch('/api/appointments?sort=asc')) as { data: AppointmentItem[] };
    setAppointments(data.data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData] = await Promise.all([apiFetch('/api/me'), loadAppointments()]);
        setProfile(profileData as UserProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

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
        setRescheduleTimes(filterBusinessHours(data.availableTimes || []));
      } catch (err) {
        setRescheduleTimes([]);
      }
    };

    loadRescheduleTimes();
  }, [reschedule?.date, reschedule?.id]);

  const updateStatus = async (id: string, action: string) => {
    setError('');
    try {
      await apiFetch(`/api/appointments/${id}/${action}`, { method: 'PATCH' });
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await apiFetch(`/api/appointments/${id}`, { method: 'DELETE' });
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleReschedule = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reschedule) return;

    setError('');
    try {
      await apiFetch(`/api/appointments/${reschedule.id}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify({ date: reschedule.date, time: reschedule.time }),
      });
      setReschedule(null);
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reschedule failed');
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center text-sm font-semibold text-amber-400 hover:text-amber-300"
            >
              Back to Home
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">Barber Dashboard</h1>
            <p className="text-gray-400">Welcome back, {profile?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-amber-500 text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-amber-400 transition-all"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Appointments</h2>
          {appointments.length === 0 ? (
            <p className="text-gray-600">No appointments found.</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment._id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{appointment.customerName}</h3>
                      <p className="text-gray-600">{appointment.customerEmail} | {appointment.customerPhone}</p>
                      <p className="text-gray-600">{appointment.service}</p>
                      <p className="text-gray-600">
                        Price: {Number(appointment.price || 0).toFixed(2)}
                      </p>
                      <p className="text-gray-600">
                        {appointment.date} at {formatTime(appointment.time)}
                      </p>
                      <p className="text-amber-600 font-semibold">{appointment.status}</p>
                      {appointment.notes && (
                        <p className="text-gray-500">Notes: {appointment.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateStatus(appointment._id, 'confirm')}
                        className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-400"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(appointment._id, 'complete')}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-400"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => updateStatus(appointment._id, 'cancel')}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setReschedule({
                          id: appointment._id,
                          date: appointment.date,
                          time: appointment.time,
                        })}
                        className="border border-slate-900 px-4 py-2 rounded-lg font-semibold text-slate-900 hover:bg-slate-100"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleDelete(appointment._id)}
                        className="border border-red-500 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {reschedule?.id === appointment._id && (
                    <form onSubmit={handleReschedule} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="date"
                        value={reschedule.date}
                        onChange={(event) =>
                          setReschedule((prev) =>
                            prev ? { ...prev, date: event.target.value } : prev
                          )
                        }
                        required
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                      />
                      <select
                        value={reschedule.time}
                        onChange={(event) =>
                          setReschedule((prev) =>
                            prev ? { ...prev, time: event.target.value } : prev
                          )
                        }
                        required
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                      >
                        <option value="">Select time</option>
                        {rescheduleTimes.length === 0 && reschedule.date ? (
                          <option value="" disabled>
                            No slots available
                          </option>
                        ) : (
                          rescheduleTimes.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))
                        )}
                      </select>
                      <button
                        type="submit"
                        className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-400"
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
    </div>
  );
}

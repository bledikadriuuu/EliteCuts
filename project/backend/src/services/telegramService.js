const changeLabels = {
  created: 'New appointment created',
  confirmed: 'Appointment confirmed',
  rescheduled: 'Appointment rescheduled',
  canceled: 'Appointment canceled',
  deleted: 'Appointment deleted',
  updated: 'Appointment updated',
  completed: 'Appointment completed',
};

const formatTime = (time) => {
  if (!time) return '';
  const [hourRaw, minuteRaw] = time.split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time;
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
};

const buildMessage = (appointment, changeType) => {
  const price = Number(appointment.servicePrice ?? 0).toFixed(2);
  const title = changeLabels[changeType] || 'Appointment update';
  const timeLabel = formatTime(appointment.time);

  const lines = [
    title,
    `ID: ${appointment.id || appointment._id}`,
    `Name: ${appointment.customerName}`,
    `Phone: ${appointment.customerPhone}`,
    `Email: ${appointment.customerEmail}`,
    `Service: ${appointment.serviceName}`,
    `Price: €${price}`,
    `Date: ${appointment.date}`,
    `Time: ${timeLabel || appointment.time}`,
    `Notes: ${appointment.notes || 'None'}`,
    `Status: ${appointment.status}`,
  ];

  return lines.join('\n');
};

export const sendAppointmentNotification = async (appointment, changeType) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildMessage(appointment, changeType),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Telegram notification failed', text);
    }
  } catch (error) {
    console.error('Telegram notification failed', error);
  }
};

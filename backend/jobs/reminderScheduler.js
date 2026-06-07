const cron = require('node-cron');
const Vaccination = require('../models/Vaccination');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Pet = require('../models/Pet');
const {
  sendAppointmentReminder24h,
  sendAppointmentReminder2h,
  sendVaccineReminder30d,
  sendVaccineReminder7d,
  sendVaccineDueToday
} = require('../services/emailService');
const { createNotification } = require('../services/notificationService');
const logger = require('../utils/logger');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function startOfDay(d) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}

function endOfDay(d) {
  const e = new Date(d);
  e.setHours(23, 59, 59, 999);
  return e;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// ─── VACCINE REMINDERS ────────────────────────────────────────────────────────

async function runVaccineReminders() {
  try {
    const now = new Date();

    // Due today
    const todayVaccines = await Vaccination.find({
      nextDueDate: { $gte: startOfDay(now), $lte: endOfDay(now) },
      deletedAt: null
    }).populate('pet').populate('user');

    for (const v of todayVaccines) {
      if (!v.user?.email || !v.pet) continue;
      await sendVaccineDueToday(v.user, v.pet, v);
      await createNotification(
        v.user._id, 'vaccine_reminder',
        '🔴 Vaccine Due Today',
        `${v.pet.name} is due for ${v.vaccineName} TODAY`,
        { petId: v.pet._id, vaccineId: v._id }
      );
    }

    // Due in 7 days
    const in7Start = startOfDay(addDays(now, 7));
    const in7End = endOfDay(addDays(now, 7));
    const week7Vaccines = await Vaccination.find({
      nextDueDate: { $gte: in7Start, $lte: in7End },
      reminded: false,
      deletedAt: null
    }).populate('pet').populate('user');

    for (const v of week7Vaccines) {
      if (!v.user?.email || !v.pet) continue;
      await sendVaccineReminder7d(v.user, v.pet, v);
      await createNotification(
        v.user._id, 'vaccine_reminder',
        '💉 Vaccine Due in 7 Days',
        `${v.pet.name} is due for ${v.vaccineName} in 7 days`,
        { petId: v.pet._id, vaccineId: v._id }
      );
      await Vaccination.findByIdAndUpdate(v._id, { reminded: true });
    }

    // Due in 30 days
    const in30Start = startOfDay(addDays(now, 30));
    const in30End = endOfDay(addDays(now, 30));
    const month30Vaccines = await Vaccination.find({
      nextDueDate: { $gte: in30Start, $lte: in30End },
      reminded: false,
      deletedAt: null
    }).populate('pet').populate('user');

    for (const v of month30Vaccines) {
      if (!v.user?.email || !v.pet) continue;
      await sendVaccineReminder30d(v.user, v.pet, v);
      await createNotification(
        v.user._id, 'vaccine_reminder',
        '💉 Vaccine Due in 30 Days',
        `${v.pet.name} is due for ${v.vaccineName} in 30 days`,
        { petId: v.pet._id, vaccineId: v._id }
      );
    }

    const total = todayVaccines.length + week7Vaccines.length + month30Vaccines.length;
    if (total > 0) logger.info(`📧 Sent ${total} vaccine reminder email(s)`);
  } catch (err) {
    logger.error('Vaccine reminder job failed:', err);
  }
}

// ─── APPOINTMENT REMINDERS ────────────────────────────────────────────────────

async function runAppointmentReminders24h() {
  try {
    const tomorrow = addDays(new Date(), 1);

    const appointments = await Appointment.find({
      date: { $gte: startOfDay(tomorrow), $lte: endOfDay(tomorrow) },
      status: { $in: ['Pending', 'Confirmed'] },
      reminderSent: false,
      deletedAt: null
    }).populate('pet').populate('user');

    for (const appt of appointments) {
      if (!appt.user?.email || !appt.pet) continue;
      await sendAppointmentReminder24h(appt.user, appt.pet, appt);
      await createNotification(
        appt.user._id, 'appointment_reminder',
        '📅 Appointment Tomorrow',
        `${appt.pet.name} has an appointment with Dr. ${appt.vetName} tomorrow`,
        { appointmentId: appt._id, petId: appt.pet._id }
      );
      await Appointment.findByIdAndUpdate(appt._id, { reminderSent: true });
    }

    if (appointments.length > 0) logger.info(`📧 Sent ${appointments.length} 24h appointment reminder(s)`);
  } catch (err) {
    logger.error('24h appointment reminder job failed:', err);
  }
}

async function runAppointmentReminders2h() {
  try {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const windowStart = new Date(twoHoursLater.getTime() - 5 * 60 * 1000); // ±5 min window
    const windowEnd = new Date(twoHoursLater.getTime() + 5 * 60 * 1000);

    // Find appointments where date+time falls in the 2h window
    // Since 'time' is stored as a string (e.g. "14:00"), we filter by date and check time string
    const targetDate = twoHoursLater;
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    const appointments = await Appointment.find({
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['Pending', 'Confirmed'] },
      deletedAt: null
    }).populate('pet').populate('user');

    const toNotify = appointments.filter(appt => {
      if (!appt.time) return false;
      // Parse time string "HH:MM" against targetDate
      const [h, m] = appt.time.split(':').map(Number);
      const apptTime = new Date(targetDate);
      apptTime.setHours(h, m, 0, 0);
      return apptTime >= windowStart && apptTime <= windowEnd;
    });

    for (const appt of toNotify) {
      if (!appt.user?.email || !appt.pet) continue;
      await sendAppointmentReminder2h(appt.user, appt.pet, appt);
      await createNotification(
        appt.user._id, 'appointment_reminder',
        '⏰ Appointment in 2 Hours',
        `${appt.pet.name}'s appointment with Dr. ${appt.vetName} starts in ~2 hours`,
        { appointmentId: appt._id, petId: appt.pet._id }
      );
    }

    if (toNotify.length > 0) logger.info(`📧 Sent ${toNotify.length} 2h appointment reminder(s)`);
  } catch (err) {
    logger.error('2h appointment reminder job failed:', err);
  }
}

// ─── SCHEDULER ────────────────────────────────────────────────────────────────

function startReminders() {
  // Vaccine reminders — daily at 8:00 AM
  cron.schedule('0 8 * * *', runVaccineReminders, { timezone: 'UTC' });

  // 24h appointment reminders — daily at 9:00 AM
  cron.schedule('0 9 * * *', runAppointmentReminders24h, { timezone: 'UTC' });

  // 2h appointment reminders — every 15 minutes (checks rolling window)
  cron.schedule('*/15 * * * *', runAppointmentReminders2h, { timezone: 'UTC' });

  logger.info('📅 Reminder scheduler started (vaccines @8AM, appointments @9AM + every 15min for 2h reminders)');
}

module.exports = {
  startReminders,
  runVaccineReminders,
  runAppointmentReminders24h,
  runAppointmentReminders2h
};
